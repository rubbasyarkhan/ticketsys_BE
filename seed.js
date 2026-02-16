import mongoose from "mongoose";
import { Agent } from "./src/models/agent.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing agents if any (optional, but good for clean seed)
    await Agent.deleteMany({});
    console.log("Cleared existing agents");

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

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
