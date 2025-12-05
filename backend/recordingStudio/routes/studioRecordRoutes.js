// backend/recordingStudio/routes/studioRecordRoutes.js
// Recording Routes for PowerHarmony Rooms
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Start recording session
 * POST /api/studio/record/start
 */
router.post("/start", async (req, res) => {
  try {
    const { room, projectId, settings } = req.body;
    const userId = req.user?.id || req.user?._id;

    const sessionId = `record_${Date.now()}`;

    res.json({
      ok: true,
      sessionId,
      room: room || "vocal",
      projectId,
      status: "recording",
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error starting recording:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Stop recording session
 * POST /api/studio/record/stop
 */
router.post("/stop", async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Mock: In production, this would stop the recording and save the file
    const audioUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/v${Date.now()}/recording.mp3`;

    res.json({
      ok: true,
      sessionId,
      status: "stopped",
      audioUrl,
      duration: 120, // seconds
      stoppedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error stopping recording:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;

