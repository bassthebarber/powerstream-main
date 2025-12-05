// backend/routes/liveRoutes.js
import express from "express";
import { authRequired } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { 
  health, 
  getStatus, 
  startStream, 
  stopStream 
} from "../controllers/liveController.js";

const router = express.Router();

// Health check for live system
router.get("/health", health);

// Get current stream status
router.get("/status", getStatus);

// Start a live stream (requires auth + role)
router.post("/start", authRequired, requireRole("admin", "stationOwner"), startStream);

// Stop a live stream (requires auth + role)
router.post("/stop", authRequired, requireRole("admin", "stationOwner"), stopStream);

export default router;
