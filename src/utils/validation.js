import { z } from "zod";

export const ticketSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    userId: z.string().optional(),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
    priority: z.enum(["low", "medium", "high"]),
    category: z.string().min(2, "Category is required"),
    attachments: z.array(z.string()).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const agentRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "agent"]).optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "Open",
      "In Progress",
      "Waiting for User",
      "Resolved",
      "Closed",
    ]),
  }),
});

export const assignTicketSchema = z.object({
  body: z.object({
    agentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Agent ID"),
  }),
});

export const replySchema = z.object({
  body: z.object({
    message: z.string().min(1, "Reply message cannot be empty"),
    attachments: z.array(z.string()).optional(),
  }),
});
