import mongoose from "mongoose";
import dotenv from "dotenv";
import { Agent } from "./models/agent.model.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const existingAdmin = await Agent.findOne({ email: "admin@ticketing.com" });

        if (existingAdmin) {
            console.log("Admin already exists");
        } else {
            await Agent.create({
                name: "System Admin",
                email: "admin@ticketing.com",
                password: "admin123", // The model will hash this automatically via pre-save hook
                role: "admin",
            });
            console.log("Default admin created: admin@ticketing.com / admin123");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedAdmin();
