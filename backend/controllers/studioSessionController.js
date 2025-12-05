// backend/controllers/studioSessionController.js
// Studio Session/Project Management Controller
import StudioSession from "../recordingStudio/models/StudioSession.js";

/**
 * Save session/project
 * POST /api/studio/sessions/save
 */
export async function saveSession(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const { sessionId, projectName, type, data } = req.body;

    if (!projectName && !sessionId) {
      return res.status(400).json({ ok: false, message: "projectName is required for new sessions" });
    }

    let session;
    if (sessionId) {
      // Update existing session
      session = await StudioSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ ok: false, message: "Session not found" });
      }
      if (String(session.userId) !== String(userId)) {
        return res.status(403).json({ ok: false, message: "Forbidden" });
      }
      
      // Update fields if provided
      if (projectName) session.projectName = projectName;
      if (type) session.type = type;
      if (data) session.data = data;
      session.updatedAt = new Date();
      await session.save();
    } else {
      // Create new session
      session = new StudioSession({
        userId,
        projectName: projectName || `Untitled ${type || "beat"}`,
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
        data: session.data,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({ ok: false, message: "Failed to save session", error: error.message });
  }
}

/**
 * List sessions for current user
 * GET /api/studio/sessions
 */
export async function listSessions(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const { type, limit = 20 } = req.query;

    const query = { userId };
    if (type) query.type = type;

    const sessions = await StudioSession.find(query)
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      ok: true,
      sessions: sessions.map((s) => ({
        id: s._id.toString(),
        projectName: s.projectName,
        type: s.type,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      total: sessions.length,
    });
  } catch (error) {
    console.error("Error listing sessions:", error);
    res.status(500).json({ ok: false, message: "Failed to list sessions", error: error.message });
  }
}

/**
 * Get session by ID
 * GET /api/studio/sessions/:id
 */
export async function getSession(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const { id } = req.params;
    const session = await StudioSession.findById(id).lean();

    if (!session) {
      return res.status(404).json({ ok: false, message: "Session not found" });
    }

    if (String(session.userId) !== String(userId)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    res.json({
      ok: true,
      session: {
        id: session._id.toString(),
        projectName: session.projectName,
        type: session.type,
        data: session.data,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error loading session:", error);
    res.status(500).json({ ok: false, message: "Failed to load session", error: error.message });
  }
}

export default {
  saveSession,
  listSessions,
  getSession,
};

