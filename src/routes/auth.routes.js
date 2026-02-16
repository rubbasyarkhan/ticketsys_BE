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
router.route("/register").post(async (req, res, next) => {
  const agentCount = await Agent.countDocuments();
  if (agentCount === 0) {
    return registerAgent(req, res, next);
  }
  // This nested callback structure is a workaround for conditional middleware.
  // A cleaner approach would be to create a custom middleware that handles the conditional logic.
  return verifyJWT(req, res, () =>
    authorize("admin")(req, res, () =>
      validate(agentRegisterSchema)(req, res, () =>
        registerAgent(req, res, next),
      ),
    ),
  );
});
// Re-implementing with cleaner middleware chain is better, but for now I'll just use a conditional one.

router.route("/me").get(verifyJWT, getMe);

export default router;
