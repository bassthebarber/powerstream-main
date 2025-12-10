// backend/src/api/routes/events.routes.js
// Canonical events routes (analytics and event logging)
import { Router } from "express";
import eventsController from "../controllers/events.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Event logging (anonymous allowed)
router.post("/", optionalAuth, eventsController.logEvent);
router.post("/batch", optionalAuth, eventsController.logBatch);
router.post("/view", optionalAuth, eventsController.logView);
router.post("/click", optionalAuth, eventsController.logClick);

// Protected routes
router.get("/my", requireAuth, eventsController.getMyEvents);
router.get("/stats", requireAuth, eventsController.getStats);

export default router;




