import { asyncHandler } from "../utils/asyncHandler.js";
import { Ticket } from "../models/ticket.model.js";
import { Agent } from "../models/agent.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
        // Basic resolution time calculation logic if resolvedAt and createdAt exist
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

export { getAgentStats };
