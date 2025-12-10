// backend/routes/ai/copilotRoutes.js
// Copilot system routes per Overlord Spec
import { Router } from "express";
import {
  getStatus,
  getEvents,
  processIntent,
  setMode,
  getAlerts,
  acknowledgeAlert,
} from "../../controllers/ai/copilotController.js";
import { requireAuth, requireRole } from "../../middleware/authMiddleware.js";

const router = Router();

// All Copilot routes require authentication
router.use(requireAuth);

// GET /api/copilot/status - Get Copilot status
router.get("/status", getStatus);

// GET /api/copilot/events - Get recent Copilot events
router.get("/events", getEvents);

// POST /api/copilot/intent - Process an intent/command
router.post("/intent", processIntent);

// Admin-only routes
// POST /api/copilot/mode - Set Copilot mode (Safe, Aggressive, etc.)
router.post("/mode", requireRole("admin"), setMode);

// GET /api/copilot/alerts - Get system alerts
router.get("/alerts", requireRole("admin"), getAlerts);

// POST /api/copilot/alerts/:id/acknowledge - Acknowledge an alert
router.post("/alerts/:id/acknowledge", requireRole("admin"), acknowledgeAlert);

export default router;



