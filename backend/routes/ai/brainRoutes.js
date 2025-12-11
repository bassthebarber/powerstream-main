// backend/routes/ai/brainRoutes.js
// Brain system routes per Overlord Spec
import { Router } from "express";
import {
  getStatus,
  executeCommand,
  getCommandHistory,
  runDiagnostics,
  repairSubsystem,
} from "../../controllers/ai/brainController.js";
import { requireAuth, requireRole } from "../../middleware/authMiddleware.js";

const router = Router();

// All Brain routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole("admin"));

// GET /api/brain/status - Get Brain system status
router.get("/status", getStatus);

// POST /api/brain/command - Execute a Brain command
router.post("/command", executeCommand);

// GET /api/brain/history - Get command execution history
router.get("/history", getCommandHistory);

// POST /api/brain/diagnostics - Run system diagnostics
router.post("/diagnostics", runDiagnostics);

// POST /api/brain/repair/:subsystem - Repair a specific subsystem
router.post("/repair/:subsystem", repairSubsystem);

export default router;


