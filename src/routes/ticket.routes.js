import { Router } from "express";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  assignTicket,
  updateTicketStatus,
  replyToTicket,
  addInternalNote,
} from "../controllers/ticket.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { rateLimit } from "express-rate-limit";

import { validate } from "../middleware/validate.middleware.js";
import {
  ticketSchema,
  updateStatusSchema,
  assignTicketSchema,
  replySchema,
} from "../utils/validation.js";

const router = Router();

// Rate limit for public ticket creation
const ticketCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message:
    "Too many tickets created from this IP, please try again after 15 minutes",
});

// Public Endpoint
router
  .route("/")
  .post(ticketCreateLimiter, validate(ticketSchema), createTicket);

// Protected Endpoints (Agents and Admins)
router.use(verifyJWT);

router.route("/").get(getAllTickets);
router.route("/:id").get(getTicketById);
router
  .route("/:id/assign")
  .patch(authorize("admin"), validate(assignTicketSchema), assignTicket);
router
  .route("/:id/status")
  .patch(
    authorize("admin", "agent"),
    validate(updateStatusSchema),
    updateTicketStatus,
  );
router
  .route("/:id/reply")
  .post(authorize("admin", "agent"), validate(replySchema), replyToTicket);
router
  .route("/:id/internal-note")
  .post(authorize("admin", "agent"), addInternalNote);

export default router;
