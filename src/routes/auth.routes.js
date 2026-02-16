import { Router } from "express";
import {
  registerAgent,
  loginAgent,
  getMe,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, agentRegisterSchema } from "../utils/validation.js";
import { Agent } from "../models/agent.model.js";

const router = Router();

router.route("/login").post(validate(loginSchema), loginAgent);

// Only admins can register new agents
// Bypasses auth if no agents exist (to create the first admin)
// Custom middleware for conditional registration
const conditionalRegisterMiddleware = async (req, res, next) => {
  const agentCount = await Agent.countDocuments();
  if (agentCount === 0) {
    // Allow first admin registration without auth
    return next();
  }
  // Require admin auth and validation for subsequent registrations
  verifyJWT(req, res, (err) => {
    if (err) return next(err);
    authorize("admin")(req, res, (err) => {
      if (err) return next(err);
      validate(agentRegisterSchema)(req, res, next);
    });
  });
};

router.route("/register").post(conditionalRegisterMiddleware, registerAgent);

router.route("/me").get(verifyJWT, getMe);

export default router;
