// backend/routes/multistreamSessionRoutes.js
// Routes for multistream session status and history
import express from "express";
import { authRequired } from "../middleware/requireAuth.js";
import MultistreamSession from "../models/MultistreamSession.js";
import MultistreamService from "../services/MultistreamService.js";

const router = express.Router();

/**
 * GET /api/multistream/sessions
 * Get all multistream sessions (with filters)
 */
router.get("/sessions", authRequired, async (req, res) => {
  try {
    const { stationId, limit = 50, skip = 0, status } = req.query;
    const query = { userId: req.user.id };

    if (stationId) {
      query.stationId = stationId;
    }
    if (status) {
      query.status = status;
    }

    const sessions = await MultistreamSession.find(query)
      .sort({ startedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate("stationId", "name slug")
      .populate("profileId", "name");

    const total = await MultistreamSession.countDocuments(query);

    res.json({
      ok: true,
      sessions: sessions.map((s) => ({
        id: s._id.toString(),
        sessionId: s.sessionId,
        stationId: s.stationId?._id?.toString(),
        stationName: s.stationId?.name,
        profileId: s.profileId?._id?.toString(),
        profileName: s.profileId?.name,
        status: s.status,
        startedAt: s.startedAt,
        stoppedAt: s.stoppedAt,
        duration: s.duration,
        endpoints: s.endpoints,
        recordingReady: s.recordingReady,
        vodAssetId: s.vodAssetId,
        title: s.title,
      })),
      total,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/multistream/sessions/:sessionId
 * Get detailed status of a specific session
 */
router.get("/sessions/:sessionId", authRequired, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // First check in-memory process status
    const processStatus = MultistreamService.getMultistreamStatus(sessionId);

    // Then get database record
    const session = await MultistreamSession.findOne({
      sessionId,
      userId: req.user.id,
    })
      .populate("stationId", "name slug")
      .populate("profileId", "name");

    if (!session && !processStatus) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    // Merge process status with DB record
    const status = processStatus || {
      sessionId: session.sessionId,
      status: session.status,
      endpoints: session.endpoints,
      startedAt: session.startedAt,
      uptime: session.duration ? session.duration * 1000 : 0,
    };

    res.json({
      ok: true,
      session: {
        ...status,
        stationId: session?.stationId?._id?.toString(),
        stationName: session?.stationId?.name,
        profileId: session?.profileId?._id?.toString(),
        profileName: session?.profileId?.name,
        title: session?.title,
        description: session?.description,
        recordingReady: session?.recordingReady,
        vodAssetId: session?.vodAssetId,
        stoppedAt: session?.stoppedAt,
        duration: session?.duration,
      },
    });
  } catch (error) {
    console.error("Error fetching session status:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/multistream/status
 * Get status of all active multistream sessions (real-time)
 */
router.get("/status", authRequired, async (req, res) => {
  try {
    const activeSessions = MultistreamService.getAllActiveMultistreams();

    res.json({
      ok: true,
      sessions: activeSessions,
      totalActive: activeSessions.filter((s) => s.status === "active").length,
    });
  } catch (error) {
    console.error("Error getting multistream status:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;






