// backend/routes/liveRoutes.js
import express from "express";
import { authRequired, authOptional } from "../middleware/requireAuth.js";
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

// GET /api/live/active - Get active live streams
router.get("/active", authOptional, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Return active streams (mock data for now - connect to real stream DB later)
    const activeStreams = [
      // {
      //   id: "stream-1",
      //   title: "Live from the Studio",
      //   streamer: { name: "DJ PowerStream", avatar: "" },
      //   viewers: 142,
      //   thumbnail: "",
      //   startedAt: new Date().toISOString(),
      // }
    ];
    
    res.json({
      ok: true,
      streams: activeStreams.slice(0, limit),
      count: activeStreams.length,
    });
  } catch (err) {
    res.json({ ok: true, streams: [], count: 0 });
  }
});

// Start a live stream (requires auth + role)
router.post("/start", authRequired, requireRole("admin", "stationOwner"), startStream);

// Stop a live stream (requires auth + role)
router.post("/stop", authRequired, requireRole("admin", "stationOwner"), stopStream);

export default router;
