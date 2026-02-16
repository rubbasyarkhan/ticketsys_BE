import { asyncHandler } from "../utils/asyncHandler.js";
import { Ticket } from "../models/ticket.model.js";
import { Agent } from "../models/agent.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const getAgentStats = asyncHandler(async (req, res) => {
  const stats = await Agent.aggregate([
    {
      $lookup: {
        from: "tickets",
        localField: "_id",
        foreignField: "assignedTo",
        as: "assignedTickets",
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        role: 1,
        phoneNumber: 1,
        avatar: 1,
        ticketsClosedCount: 1,
        assignedTicketsCount: { $size: "$assignedTickets" },
        openTicketsCount: {
          $size: {
            $filter: {
              input: "$assignedTickets",
              as: "ticket",
              cond: { $ne: ["$$ticket.status", "Closed"] },
            },
          },
        },
        averageResolutionTime: {
          $avg: {
            $map: {
              input: {
                $filter: {
                  input: "$assignedTickets",
                  as: "t",
                  cond: { $eq: ["$$t.status", "Closed"] },
                },
              },
              as: "t",
              in: { $subtract: ["$$t.closedAt", "$$t.createdAt"] },
            },
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Agent stats fetched successfully"));
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalTickets = await Ticket.countDocuments();
  const openTickets = await Ticket.countDocuments({ status: "Open" });
  const inProgress = await Ticket.countDocuments({ status: "In Progress" });
  const closed = await Ticket.countDocuments({
    status: { $in: ["Closed", "Resolved"] },
  });

  // Stats for the logged-in agent
  const assignedToMe = await Ticket.countDocuments({
    assignedTo: req.user._id,
  });
  const closedByMe = await Ticket.countDocuments({
    closedBy: req.user._id,
    status: { $in: ["Closed", "Resolved"] },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalTickets,
        openTickets,
        inProgress,
        closed,
        assignedToMe,
        closedByMe,
      },
      "Dashboard stats fetched successfully",
    ),
  );
});

const getAgentDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const agent = await Agent.findById(id).select("-password");
  if (!agent) {
    throw new ApiError(404, "Agent not found");
  }

  const stats = await Agent.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "tickets",
        localField: "_id",
        foreignField: "assignedTo",
        as: "assignedTickets",
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        role: 1,
        phoneNumber: 1,
        avatar: 1,
        ticketsClosedCount: 1,
        assignedTicketsCount: { $size: "$assignedTickets" },
        openTicketsCount: {
          $size: {
            $filter: {
              input: "$assignedTickets",
              as: "ticket",
              cond: { $ne: ["$$ticket.status", "Closed"] },
            },
          },
        },
        averageResolutionTime: {
          $avg: {
            $map: {
              input: {
                $filter: {
                  input: "$assignedTickets",
                  as: "t",
                  cond: { $eq: ["$$t.status", "Closed"] },
                },
              },
              as: "t",
              in: { $subtract: ["$$t.closedAt", "$$t.createdAt"] },
            },
          },
        },
      },
    },
  ]);

  const recentTickets = await Ticket.find({ assignedTo: id })
    .sort({ createdAt: -1 })
    .limit(5);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        agent: stats[0],
        recentTickets,
      },
      "Agent details fetched successfully",
    ),
  );
});

const createAgent = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber, avatar, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existedAgent = await Agent.findOne({ email });

  if (existedAgent) {
    throw new ApiError(409, "Agent with email already exists");
  }

  const agent = await Agent.create({
    name,
    email,
    password,
    phoneNumber: phoneNumber || "",
    avatar:
      avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    role: role || "agent",
  });

  const createdAgent = await Agent.findById(agent._id).select("-password");

  if (!createdAgent) {
    throw new ApiError(500, "Something went wrong while creating the agent");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdAgent, "Agent created successfully"));
});

export { getAgentStats, getDashboardStats, getAgentDetail, createAgent };
