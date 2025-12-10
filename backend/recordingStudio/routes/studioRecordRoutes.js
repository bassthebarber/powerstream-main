// backend/recordingStudio/routes/studioRecordRoutes.js
// Recording Routes for PowerHarmony Rooms - REAL LOGIC (v2)
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { requireAuth } from "../middleware/requireAuth.js";
import StudioSession from "../models/StudioSession.js";
import Recording from "../models/Recording.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// --- Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Multer for in-memory file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (_req, file, cb) => {
    const ok = /^(audio|video)\//.test(file.mimetype);
    if (!ok) return cb(new Error("Only audio/video files are allowed"));
    cb(null, true);
  },
});

// Helper: Upload buffer to Cloudinary
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "powerstream/recordings",
        resource_type: "video", // works for audio too
        ...options,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/**
 * Start recording session
 * POST /api/studio/record/start
 * Creates a real StudioSession document with status: "recording"
 */
router.post("/start", async (req, res) => {
  try {
    const { room, projectName, settings, beatId, beatUrl } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    // Create a new recording session in the database
    const session = new StudioSession({
      userId,
      projectName: projectName || `Recording ${new Date().toLocaleString()}`,
      type: "recording",
      data: {
        room: room || "vocal",
        settings: settings || {},
        beatId: beatId || null,
        beatUrl: beatUrl || null,
        recordingStatus: "recording",
        startedAt: new Date().toISOString(),
        takes: [], // Will store take URLs
      },
      status: "draft",
    });

    await session.save();

    console.log(`[RECORD] Session started: ${session._id} for user ${userId}`);

    res.json({
      ok: true,
      sessionId: session._id.toString(),
      room: room || "vocal",
      projectName: session.projectName,
      status: "recording",
      startedAt: session.data.get("startedAt"),
    });
  } catch (error) {
    console.error("[RECORD] Error starting recording:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Upload a recording take (audio blob)
 * POST /api/studio/record/upload
 * Accepts multipart form with "file" field, links to session
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { sessionId, takeNumber, title } = req.body;

    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No file provided" });
    }

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      public_id: `take_${sessionId || "unknown"}_${Date.now()}`,
      context: { sessionId, takeNumber, originalname: req.file.originalname },
    });

    const audioUrl = result.secure_url;
    const duration = result.duration || 0;

    // Create Recording document
    const recording = new Recording({
      title: title || `Take ${takeNumber || 1}`,
      audioUrl,
      durationSeconds: duration,
      fileSize: req.file.size,
      format: result.format || "webm",
      source: "record",
      ownerUserId: userId,
      status: "ready",
    });

    await recording.save();

    // Link to session if provided
    if (sessionId) {
      const session = await StudioSession.findById(sessionId);
      if (session && String(session.userId) === String(userId)) {
        const takes = session.data.get("takes") || [];
        takes.push({
          recordingId: recording._id.toString(),
          audioUrl,
          duration,
          takeNumber: takeNumber || takes.length + 1,
          uploadedAt: new Date().toISOString(),
        });
        session.data.set("takes", takes);
        await session.save();
      }
    }

    console.log(`[RECORD] Take uploaded: ${recording._id} (${duration}s)`);

    res.json({
      ok: true,
      recordingId: recording._id.toString(),
      audioUrl,
      duration,
      format: result.format,
      bytes: result.bytes,
      sessionId,
    });
  } catch (error) {
    console.error("[RECORD] Error uploading take:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Stop recording session
 * POST /api/studio/record/stop
 * Marks the session as stopped
 */
router.post("/stop", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!sessionId) {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }

    const session = await StudioSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    if (String(session.userId) !== String(userId)) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    // Update session status
    session.data.set("recordingStatus", "stopped");
    session.data.set("stoppedAt", new Date().toISOString());
    await session.save();

    // Get the takes for this session
    const takes = session.data.get("takes") || [];
    const totalDuration = takes.reduce((sum, t) => sum + (t.duration || 0), 0);

    console.log(`[RECORD] Session stopped: ${sessionId} (${takes.length} takes, ${totalDuration}s total)`);

    res.json({
      ok: true,
      sessionId,
      status: "stopped",
      stoppedAt: session.data.get("stoppedAt"),
      takes: takes.length,
      totalDuration,
    });
  } catch (error) {
    console.error("[RECORD] Error stopping recording:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Get recording session details
 * GET /api/studio/record/:sessionId
 */
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const session = await StudioSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    if (String(session.userId) !== String(userId)) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const takes = session.data.get("takes") || [];

    res.json({
      ok: true,
      session: {
        id: session._id.toString(),
        projectName: session.projectName,
        type: session.type,
        status: session.status,
        recordingStatus: session.data.get("recordingStatus"),
        room: session.data.get("room"),
        beatUrl: session.data.get("beatUrl"),
        startedAt: session.data.get("startedAt"),
        stoppedAt: session.data.get("stoppedAt"),
        takes,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("[RECORD] Error getting session:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * List user's recording sessions
 * GET /api/studio/record
 */
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { limit = 20 } = req.query;

    const sessions = await StudioSession.find({
      userId,
      type: "recording",
    })
      .sort({ updatedAt: -1 })
      .limit(Number(limit));

    res.json({
      ok: true,
      sessions: sessions.map((s) => ({
        id: s._id.toString(),
        projectName: s.projectName,
        status: s.status,
        recordingStatus: s.data.get("recordingStatus"),
        room: s.data.get("room"),
        takesCount: (s.data.get("takes") || []).length,
        startedAt: s.data.get("startedAt"),
        stoppedAt: s.data.get("stoppedAt"),
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      total: sessions.length,
    });
  } catch (error) {
    console.error("[RECORD] Error listing sessions:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Play a recording take (redirect to audio URL)
 * GET /api/studio/record/play/:recordingId
 */
router.get("/play/:recordingId", async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const recording = await Recording.findById(recordingId);
    if (!recording) {
      return res.status(404).json({ ok: false, error: "Recording not found" });
    }

    // Optional: Check ownership
    if (recording.ownerUserId && String(recording.ownerUserId) !== String(userId)) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    // Redirect to the audio URL (Cloudinary or local)
    if (recording.audioUrl) {
      return res.redirect(recording.audioUrl);
    }

    // Fallback: If local file path exists, serve it
    if (recording.localFilePath) {
      const path = await import("path");
      return res.sendFile(path.default.resolve(recording.localFilePath));
    }

    return res.status(404).json({ ok: false, error: "Audio file not found" });
  } catch (error) {
    console.error("[RECORD] Error playing take:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Delete a recording take
 * DELETE /api/studio/record/take/:recordingId
 */
router.delete("/take/:recordingId", async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const recording = await Recording.findById(recordingId);
    if (!recording) {
      return res.status(404).json({ ok: false, error: "Recording not found" });
    }

    if (String(recording.ownerUserId) !== String(userId)) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    // Delete from Cloudinary if possible
    if (recording.audioUrl && recording.audioUrl.includes("cloudinary")) {
      try {
        const publicId = recording.audioUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`powerstream/recordings/${publicId}`, {
          resource_type: "video",
        });
      } catch (err) {
        console.warn("[RECORD] Failed to delete from Cloudinary:", err.message);
      }
    }

    await Recording.findByIdAndDelete(recordingId);

    console.log(`[RECORD] Take deleted: ${recordingId}`);

    res.json({ ok: true, message: "Recording deleted" });
  } catch (error) {
    console.error("[RECORD] Error deleting take:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
