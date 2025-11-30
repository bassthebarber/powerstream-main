// backend/routes/liveRoutes.js
import express from "express";
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

// Start a live stream
router.post("/start", startStream);

// Stop a live stream
router.post("/stop", stopStream);

export default router;
