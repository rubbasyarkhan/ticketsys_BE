import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Ticket } from "../models/ticket.model.js";
import { Agent } from "../models/agent.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateTicketId } from "../services/ticketId.service.js";
import {
  sendTicketCreatedEmail,
  sendAgentReplyEmail,
  sendTicketClosedEmail,
} from "../services/email.service.js";
import mongoose from "mongoose";

const createTicket = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    userId,
    subject,
    message,
    priority,
    category,
    attachments,
  } = req.body;

  const ticketId = await generateTicketId();

  const ticket = await Ticket.create({
    ticketId,
    name,
    email,
    userId,
    subject,
    message,
    priority,
    category,
    attachments,
    activityLogs: [
      {
        action: "CREATED",
        timestamp: new Date(),
      },
    ],
  });

  // Background tasks
  sendTicketCreatedEmail(ticket).catch((err) =>
    console.error("Email Error:", err),
  );

  return res
    .status(201)
    .json(new ApiResponse(201, ticket, "Ticket created successfully"));
});

const getAllTickets = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    assignedTo,
    search,
    startDate,
    endDate,
  } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  if (search) {
    filter.$or = [
      { ticketId: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
    ];
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const tickets = await Ticket.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("assignedTo", "name email");

  const total = await Ticket.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tickets,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
      "Tickets fetched successfully",
    ),
  );
});

const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("assignedTo", "name email")
    .populate("closedBy", "name email")
    .populate("messages.sender", "name email");

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket details fetched successfully"));
});

const assignTicket = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const previousAgent = ticket.assignedTo;
  ticket.assignedTo = agentId;
  ticket.activityLogs.push({
    action: "ASSIGNED",
    performedBy: req.user._id,
    previousValue: previousAgent ? previousAgent.toString() : "Unassigned",
    newValue: agentId.toString(),
  });

  await ticket.save();

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket assigned successfully"));
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const previousStatus = ticket.status;
  ticket.status = status;

  ticket.activityLogs.push({
    action: "STATUS_CHANGED",
    performedBy: req.user._id,
    previousValue: previousStatus,
    newValue: status,
  });

  if (status === "Closed") {
    ticket.closedBy = req.user._id;
    ticket.closedAt = new Date();

    // Increment agent ticketsClosedCount
    await Agent.findByIdAndUpdate(req.user._id, {
      $inc: { ticketsClosedCount: 1 },
    });

    sendTicketClosedEmail(ticket).catch((err) =>
      console.error("Email Error:", err),
    );
  }

  await ticket.save();

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket status updated successfully"));
});

const replyToTicket = asyncHandler(async (req, res) => {
  const { message, attachments } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const newMessage = {
    senderType: "agent",
    sender: req.user._id,
    senderTypeModel: "Agent",
    message,
    attachments,
    timestamp: new Date(),
  };

  ticket.messages.push(newMessage);
  ticket.status = "In Progress";
  ticket.activityLogs.push({
    action: "REPLIED",
    performedBy: req.user._id,
    newValue: "Agent replied",
  });

  await ticket.save();

  sendAgentReplyEmail(ticket, message).catch((err) =>
    console.error("Email Error:", err),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Reply added successfully"));
});

const addInternalNote = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  ticket.internalNotes.push({
    note,
    addedBy: req.user._id,
    timestamp: new Date(),
  });

  await ticket.save();

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Internal note added successfully"));
});

const updateTicketCategory = asyncHandler(async (req, res) => {
  const { category } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const previousCategory = ticket.category;
  ticket.category = category;

  ticket.activityLogs.push({
    action: "CATEGORY_CHANGED",
    performedBy: req.user._id,
    previousValue: previousCategory,
    newValue: category,
  });

  await ticket.save();

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket category updated successfully"));
});

export {
  createTicket,
  getAllTickets,
  getTicketById,
  assignTicket,
  updateTicketStatus,
  replyToTicket,
  addInternalNote,
  updateTicketCategory,
};
