// backend/routes/studioSessionRoutes.js
// Studio Session/Project Management Routes
import { Router } from "express";
import { saveSession, listSessions, getSession } from "../controllers/studioSessionController.js";
import { authRequired, authOptional } from "../middleware/requireAuth.js";

const router = Router();

/**
 * Health check
 * GET /api/studio/sessions/health
 */
router.get("/health", (req, res) => {
  res.json({ ok: true, service: "studio-sessions" });
});

/**
 * List sessions for current user
 * GET /api/studio/sessions
 * Returns empty array if not authenticated (graceful degradation)
 */
router.get("/", authOptional, async (req, res) => {
  try {
    // If not authenticated, return empty sessions
    if (!req.user || !req.user.id) {
      return res.json({ ok: true, sessions: [], total: 0, message: "Login to see your sessions" });
    }
    
    // Inline the listSessions logic to avoid any function call issues
    const { type, limit = 20 } = req.query;
    const query = { userId: req.user.id };
    if (type) query.type = type;

    const StudioSession = (await import("../recordingStudio/models/StudioSession.js")).default;
    const sessions = await StudioSession.find(query)
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.json({
      ok: true,
      sessions: sessions.map((s) => ({
        id: s._id.toString(),
        projectName: s.projectName,
        type: s.type,
        status: s.status || "draft",
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      total: sessions.length,
    });
  } catch (err) {
    console.error("[StudioSessions] List error:", err);
    return res.json({ ok: false, sessions: [], total: 0, error: err.message });
  }
});

/**
 * Save session/project
 * POST /api/studio/sessions/save
 */
router.post("/save", authRequired, saveSession);

/**
 * Get session by ID
 * GET /api/studio/sessions/:id
 */
router.get("/:id", authRequired, getSession);

export default router;

