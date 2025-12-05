// backend/recordingStudio/routes/studioSessionRoutes.js
// Session & Project Management Routes
import express from "express";
import StudioSession from "../models/StudioSession.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Save session/project
 * POST /api/studio/session/save
 */
router.post("/save", async (req, res) => {
  try {
    const { sessionId, projectName, type, data } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!projectName) {
      return res.status(400).json({ ok: false, error: "projectName is required" });
    }

    let session;
    if (sessionId) {
      // Update existing session
      session = await StudioSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ ok: false, error: "Session not found" });
      }
      if (String(session.userId) !== String(userId)) {
        return res.status(403).json({ ok: false, error: "Forbidden" });
      }
      session.projectName = projectName;
      session.type = type || session.type;
      session.data = data || session.data;
      session.updatedAt = new Date();
      await session.save();
    } else {
      // Create new session
      session = new StudioSession({
        userId,
        projectName,
        type: type || "beat",
        data: data || {},
      });
      await session.save();
    }

    res.json({
      ok: true,
      session: {
        id: session._id.toString(),
        projectName: session.projectName,
        type: session.type,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Load session
 * GET /api/studio/session/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const session = await StudioSession.findById(id);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    if (String(session.userId) !== String(userId)) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    res.json({
      ok: true,
      session: {
        id: session._id.toString(),
        projectName: session.projectName,
        type: session.type,
        data: session.data,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error loading session:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * List sessions
 * GET /api/studio/sessions
 */
router.get("/", async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    const userId = req.user?.id || req.user?._id;

    const query = { userId };
    if (type) query.type = type;

    const sessions = await StudioSession.find(query)
      .sort({ updatedAt: -1 })
      .limit(Number(limit));

    res.json({
      ok: true,
      sessions: sessions.map((s) => ({
        id: s._id.toString(),
        projectName: s.projectName,
        type: s.type,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      total: sessions.length,
    });
  } catch (error) {
    console.error("Error listing sessions:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;

