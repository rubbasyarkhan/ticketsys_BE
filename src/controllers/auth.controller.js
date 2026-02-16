import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Agent } from "../models/agent.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerAgent = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedAgent = await Agent.findOne({ email });

  if (existedAgent) {
    throw new ApiError(409, "Agent with email already exists");
  }

  const isFirstAgent = (await Agent.countDocuments()) === 0;

  const agent = await Agent.create({
    name,
    email,
    password,
    role: isFirstAgent ? "admin" : role || "agent",
  });

  const createdAgent = await Agent.findById(agent._id).select("-password");

  if (!createdAgent) {
    throw new ApiError(500, "Something went wrong while registering the agent");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdAgent, "Agent registered successfully"));
});

const loginAgent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const agent = await Agent.findOne({ email });

  if (!agent) {
    throw new ApiError(404, "Agent does not exist");
  }

  const isPasswordValid = await agent.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid agent credentials");
  }

  const accessToken = agent.generateAccessToken();

  const loggedInAgent = await Agent.findById(agent._id).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { agent: loggedInAgent, accessToken },
        "Agent logged In successfully",
      ),
    );
});

const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current agent fetched successfully"));
});

export { registerAgent, loginAgent, getMe };
