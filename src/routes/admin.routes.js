import { Router } from "express";
import { getAgentStats } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.use(verifyJWT);
router.use(authorize("admin"));

router.route("/agent-stats").get(getAgentStats);

export default router;
