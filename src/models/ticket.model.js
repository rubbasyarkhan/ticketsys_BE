import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema({
  senderType: {
    type: String,
    enum: ["user", "agent"],
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    refPath: "messages.senderTypeModel",
  },
  senderTypeModel: {
    type: String,
    enum: ["Agent", null], // user doesn't have a model in this service
    default: null,
  },
  message: {
    type: String,
    required: true,
  },
  attachments: [String],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const activityLogSchema = new Schema({
  action: {
    type: String,
    enum: ["CREATED", "ASSIGNED", "STATUS_CHANGED", "REPLIED", "CLOSED"],
    required: true,
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: "Agent",
  },
  previousValue: String,
  newValue: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    userId: String,
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    category: String,
    status: {
      type: String,
      enum: ["Open", "In Progress", "Waiting for User", "Resolved", "Closed"],
      default: "Open",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },
    closedAt: Date,
    messages: [conversationSchema],
    internalNotes: [
      {
        note: String,
        addedBy: { type: Schema.Types.ObjectId, ref: "Agent" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    attachments: [String],
    activityLogs: [activityLogSchema],
  },
  {
    timestamps: true,
  },
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
