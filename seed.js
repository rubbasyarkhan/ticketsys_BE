import mongoose from "mongoose";
import { Agent } from "./src/models/agent.model.js";
import { Ticket } from "./src/models/ticket.model.js";
import { Counter } from "./src/models/counter.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // 1. Clear existing data
    await Agent.deleteMany({});
    await Ticket.deleteMany({});
    await Counter.deleteMany({});
    console.log("Cleared existing agents, tickets, and counters");

    // 2. Create Admin and Agent
    const admin = await Agent.create({
      name: "System Admin",
      email: "admin@example.com",
      password: "adminpassword123",
      role: "admin",
    });
    console.log("Admin user created: admin@example.com / adminpassword123");

    const agent = await Agent.create({
      name: "Support Agent",
      email: "agent@example.com",
      password: "agentpassword123",
      role: "agent",
    });
    console.log("Agent user created: agent@example.com / agentpassword123");

    // 3. Create Demo Tickets
    const ticketsData = [
      {
        ticketId: "TIC-2026-0001",
        name: "John Doe",
        email: "john.doe@gmail.com",
        subject: "Cannot access my account",
        message:
          "I am trying to login but it keeps saying 'Invalid Credentials'. I have already tried resetting my password.",
        priority: "high",
        status: "Open",
        category: "Authentication",
        assignedTo: null,
      },
      {
        ticketId: "TIC-2026-0002",
        name: "Jane Smith",
        email: "jane.smith@yahoo.com",
        subject: "Payment failed for subscription",
        message:
          "I tried to upgrade my plan today but the payment failed twice. My card is working fine on other sites.",
        priority: "high",
        status: "In Progress",
        category: "Billing",
        assignedTo: agent._id,
      },
      {
        ticketId: "TIC-2026-0003",
        name: "Robert Brown",
        email: "robert.b@outlook.com",
        subject: "Feature request: Dark mode",
        message:
          "Plase add a dark mode option to the dashboard. My eyes are burning at night.",
        priority: "low",
        status: "Open",
        category: "Feature Request",
        assignedTo: null,
      },
      {
        ticketId: "TIC-2026-0004",
        name: "Emily Davis",
        email: "emily.d@gmail.com",
        subject: "Mobile app crashing on startup",
        message:
          "The latest update (v1.2.0) is crashing every time I open it on my iPhone 13 Pro.",
        priority: "medium",
        status: "Waiting for User",
        category: "Technical Support",
        assignedTo: agent._id,
      },
      {
        ticketId: "TIC-2026-0005",
        name: "Michael Wilson",
        email: "michael.w@company.com",
        subject: "API documentation error",
        message:
          "The endpoint `/api/v1/users` returns a 404 but the docs say it should work.",
        priority: "medium",
        status: "Resolved",
        category: "Documentation",
        assignedTo: admin._id,
        closedBy: admin._id,
        closedAt: new Date(),
      },
    ];

    // Add some conversation messages to one of the tickets
    const ticketWithChat = {
      ...ticketsData[1],
      messages: [
        {
          senderType: "user",
          message:
            "I tried to upgrade my plan today but the payment failed twice. My card is working fine on other sites.",
          timestamp: new Date(Date.now() - 3600000 * 5),
        },
        {
          senderType: "agent",
          sender: agent._id,
          senderTypeModel: "Agent",
          message:
            "Hi Jane, I'm checking with our payment gateway provider. Could you tell me the last 4 digits of the card you used?",
          timestamp: new Date(Date.now() - 3600000 * 4),
        },
        {
          senderType: "user",
          message: "Sure, it's 4242.",
          timestamp: new Date(Date.now() - 3600000 * 3),
        },
      ],
      activityLogs: [
        { action: "CREATED", timestamp: new Date(Date.now() - 3600000 * 5) },
        {
          action: "ASSIGNED",
          performedBy: admin._id,
          newValue: agent.name,
          timestamp: new Date(Date.now() - 3600000 * 4.5),
        },
        {
          action: "STATUS_CHANGED",
          performedBy: agent._id,
          previousValue: "Open",
          newValue: "In Progress",
          timestamp: new Date(Date.now() - 3600000 * 4),
        },
      ],
    };

    ticketsData[1] = ticketWithChat;

    await Ticket.insertMany(ticketsData);
    console.log(`Successfully created ${ticketsData.length} demo tickets`);

    // Initialize Counter for the year 2026
    await Counter.create({ year: 2026, sequence: 5 });
    console.log("Initialized sequence counter to 5");

    // Update agent stats
    await Agent.findByIdAndUpdate(agent._id, { assignedTicketsCount: 2 });
    await Agent.findByIdAndUpdate(admin._id, {
      assignedTicketsCount: 1,
      ticketsClosedCount: 1,
    });
    console.log("Updated agent performance stats");

    mongoose.connection.close();
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
