import { Router } from "express";
import {
  getAgentStats,
  getDashboardStats,
  getAgentDetail,
  createAgent,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/dashboard-stats").get(getDashboardStats);

router.use(authorize("admin"));
router.route("/agent-stats").get(getAgentStats);
router.route("/agents").post(createAgent);
router.route("/agents/:id").get(getAgentDetail);

export default router;
