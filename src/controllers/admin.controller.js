import { asyncHandler } from "../utils/asyncHandler.js";
import { Ticket } from "../models/ticket.model.js";
import { Agent } from "../models/agent.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { getAgentStats, getDashboardStats };
