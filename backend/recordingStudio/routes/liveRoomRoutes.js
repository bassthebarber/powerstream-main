// backend/recordingStudio/routes/liveRoomRoutes.js
// Live Room API Routes - Real-time recording session management
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole, requireSessionParticipant, ROLES } from "../middleware/requireRole.js";
import LiveRoomSession, { LIVE_ROOM_STATUS, TRACK_TYPES } from "../models/LiveRoomSession.js";
import StudioJob from "../models/StudioJob.js";

const router = express.Router();

// ============================================================
// CREATE A NEW LIVE ROOM SESSION
// POST /api/studio/live-room/create
// ============================================================
router.post("/create", requireAuth, async (req, res) => {
  try {
    const { name, engineerId, beatId, beatUrl, beatName, settings, description } = req.body;
    const artistId = req.user.id || req.user._id;

    // Create the live room session
    const session = new LiveRoomSession({
      artistId,
      engineerId: engineerId || null,
      name: name || `Live Session - ${new Date().toLocaleDateString()}`,
      description: description || "",
      currentBeatId: beatId || null,
      currentBeatUrl: beatUrl || "",
      currentBeatName: beatName || "",
      settings: {
        bpm: settings?.bpm || 120,
        key: settings?.key || "C minor",
        sampleRate: settings?.sampleRate || 48000,
        bitDepth: settings?.bitDepth || 24,
        channels: settings?.channels || 2,
        monitorLatency: settings?.monitorLatency || 0,
        inputGain: settings?.inputGain || 1.0,
        monitorMix: settings?.monitorMix || 0.5,
      },
      status: LIVE_ROOM_STATUS.PENDING,
    });

    await session.save();

    res.status(201).json({
      ok: true,
      sessionId: session._id,
      roomCode: session.roomCode,
      message: "Live room session created",
      session: {
        id: session._id,
        roomCode: session.roomCode,
        name: session.name,
        status: session.status,
        artistId: session.artistId,
        engineerId: session.engineerId,
        settings: session.settings,
      },
    });
  } catch (error) {
    console.error("Error creating live room:", error);
    res.status(500).json({ ok: false, error: "Failed to create live room session" });
  }
});

// ============================================================
// JOIN A LIVE ROOM SESSION (by room code)
// POST /api/studio/live-room/join
// ============================================================
router.post("/join", requireAuth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id || req.user._id;
    const userRoles = req.user.roles || [req.user.role];

    if (!roomCode) {
      return res.status(400).json({ ok: false, error: "Room code is required" });
    }

    // Find the session by room code
    const session = await LiveRoomSession.findByRoomCode(roomCode);

    if (!session) {
      return res.status(404).json({ ok: false, error: "Live room not found" });
    }

    // Check if session is joinable
    if (session.status === LIVE_ROOM_STATUS.COMPLETED || 
        session.status === LIVE_ROOM_STATUS.CANCELLED) {
      return res.status(400).json({ 
        ok: false, 
        error: `Cannot join a ${session.status} session` 
      });
    }

    // Determine user's role in the session
    const isArtist = session.artistId.toString() === userId.toString();
    const isEngineer = session.engineerId?.toString() === userId.toString();
    const isAdmin = userRoles.includes(ROLES.ADMIN);
    const canBeEngineer = userRoles.includes(ROLES.ENGINEER) || isAdmin;

    // If user is not already the artist or engineer
    if (!isArtist && !isEngineer) {
      // If no engineer assigned and user has engineer role, assign them
      if (!session.engineerId && canBeEngineer) {
        session.engineerId = userId;
        await session.save();
      } else if (!canBeEngineer) {
        return res.status(403).json({ 
          ok: false, 
          error: "You are not authorized to join this session" 
        });
      }
    }

    // Populate for response
    await session.populate("artistId", "name email avatarUrl");
    if (session.engineerId) {
      await session.populate("engineerId", "name email avatarUrl");
    }

    res.json({
      ok: true,
      message: "Successfully joined live room",
      session: {
        id: session._id,
        roomCode: session.roomCode,
        name: session.name,
        status: session.status,
        artist: session.artistId,
        engineer: session.engineerId,
        currentBeat: {
          id: session.currentBeatId,
          url: session.currentBeatUrl,
          name: session.currentBeatName,
        },
        settings: session.settings,
        trackCount: session.tracks.length,
        yourRole: isArtist ? "artist" : (session.engineerId?.toString() === userId.toString() ? "engineer" : "observer"),
      },
    });
  } catch (error) {
    console.error("Error joining live room:", error);
    res.status(500).json({ ok: false, error: "Failed to join live room" });
  }
});

// ============================================================
// START A LIVE ROOM SESSION
// POST /api/studio/live-room/:sessionId/start
// ============================================================
router.post("/:sessionId/start", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id || req.user._id;

    const session = await LiveRoomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    // Only artist or engineer can start
    const isParticipant = 
      session.artistId.toString() === userId.toString() ||
      session.engineerId?.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ ok: false, error: "Only session participants can start the session" });
    }

    await session.start();

    res.json({
      ok: true,
      message: "Live room session started",
      session: {
        id: session._id,
        status: session.status,
        startedAt: session.startedAt,
      },
    });
  } catch (error) {
    console.error("Error starting live room:", error);
    res.status(500).json({ ok: false, error: "Failed to start live room" });
  }
});

// ============================================================
// START RECORDING A TRACK
// POST /api/studio/live-room/record/start
// ============================================================
router.post("/record/start", requireAuth, async (req, res) => {
  try {
    const { sessionId, trackType, trackName } = req.body;
    const userId = req.user.id || req.user._id;

    if (!sessionId) {
      return res.status(400).json({ ok: false, error: "Session ID is required" });
    }

    const session = await LiveRoomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    // Check if user is participant
    const isParticipant = 
      session.artistId.toString() === userId.toString() ||
      session.engineerId?.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ ok: false, error: "You are not a participant in this session" });
    }

    // Ensure session is in recording state
    if (session.status === LIVE_ROOM_STATUS.PENDING) {
      await session.start();
    }

    // Generate a track ID for this recording
    const trackId = `track_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Determine track type
    const type = Object.values(TRACK_TYPES).includes(trackType) 
      ? trackType 
      : TRACK_TYPES.VOCAL;

    // Get existing track count for naming
    const typeCount = session.tracks.filter(t => t.type === type).length + 1;
    const name = trackName || `${type.charAt(0).toUpperCase() + type.slice(1)} Take ${typeCount}`;

    res.json({
      ok: true,
      trackId,
      trackType: type,
      trackName: name,
      sessionId: session._id,
      message: "Recording started - capture audio on frontend, then call record/stop with the file URL",
      // Upload URL for direct upload (if using signed URLs)
      // For now, client will upload to /api/studio/upload and get the URL
    });
  } catch (error) {
    console.error("Error starting recording:", error);
    res.status(500).json({ ok: false, error: "Failed to start recording" });
  }
});

// ============================================================
// STOP RECORDING AND SAVE TRACK
// POST /api/studio/live-room/record/stop
// ============================================================
router.post("/record/stop", requireAuth, async (req, res) => {
  try {
    const { sessionId, trackId, trackType, trackName, finalUrl, duration, fileSize, format, notes } = req.body;
    const userId = req.user.id || req.user._id;

    if (!sessionId || !finalUrl) {
      return res.status(400).json({ ok: false, error: "Session ID and final URL are required" });
    }

    const session = await LiveRoomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    // Check if user is participant
    const isParticipant = 
      session.artistId.toString() === userId.toString() ||
      session.engineerId?.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ ok: false, error: "You are not a participant in this session" });
    }

    // Add the track to the session
    const track = {
      trackId: trackId || `track_${Date.now()}`,
      type: trackType || TRACK_TYPES.VOCAL,
      name: trackName || `Take ${session.tracks.length + 1}`,
      url: finalUrl,
      duration: duration || 0,
      fileSize: fileSize || 0,
      format: format || "webm",
      recordedBy: userId,
      recordedAt: new Date(),
      notes: notes || "",
      isSelected: false,
    };

    session.tracks.push(track);
    await session.save();

    res.json({
      ok: true,
      message: "Track saved successfully",
      track: {
        trackId: track.trackId,
        type: track.type,
        name: track.name,
        url: track.url,
        duration: track.duration,
        recordedAt: track.recordedAt,
      },
      totalTracks: session.tracks.length,
    });
  } catch (error) {
    console.error("Error stopping recording:", error);
    res.status(500).json({ ok: false, error: "Failed to save recording" });
  }
});

// ============================================================
// GET LIVE ROOM SESSION DETAILS
// GET /api/studio/live-room/:sessionId
// ============================================================
router.get("/:sessionId", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await LiveRoomSession.findById(sessionId)
      .populate("artistId", "name email avatarUrl")
      .populate("engineerId", "name email avatarUrl")
      .populate("currentBeatId", "title genre bpm fileUrl previewUrl");

    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    res.json({
      ok: true,
      session: {
        id: session._id,
        roomCode: session.roomCode,
        name: session.name,
        description: session.description,
        status: session.status,
        artist: session.artistId,
        engineer: session.engineerId,
        currentBeat: {
          id: session.currentBeatId?._id || session.currentBeatId,
          url: session.currentBeatUrl || session.currentBeatId?.fileUrl,
          name: session.currentBeatName || session.currentBeatId?.title,
        },
        settings: session.settings,
        tracks: session.tracks,
        trackCount: session.tracks.length,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        totalRecordingTime: session.totalRecordingTime,
        tags: session.tags,
        genre: session.genre,
        notes: session.notes,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting live room:", error);
    res.status(500).json({ ok: false, error: "Failed to get live room session" });
  }
});

// ============================================================
// LIST USER'S LIVE ROOM SESSIONS
// GET /api/studio/live-room
// ============================================================
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { status, limit = 20, page = 1 } = req.query;

    const query = {
      $or: [{ artistId: userId }, { engineerId: userId }],
    };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sessions = await LiveRoomSession.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("artistId", "name avatarUrl")
      .populate("engineerId", "name avatarUrl");

    const total = await LiveRoomSession.countDocuments(query);

    res.json({
      ok: true,
      sessions: sessions.map(s => ({
        id: s._id,
        roomCode: s.roomCode,
        name: s.name,
        status: s.status,
        artist: s.artistId,
        engineer: s.engineerId,
        trackCount: s.tracks.length,
        startedAt: s.startedAt,
        createdAt: s.createdAt,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error listing live rooms:", error);
    res.status(500).json({ ok: false, error: "Failed to list live room sessions" });
  }
});

// ============================================================
// PAUSE A LIVE ROOM SESSION
// POST /api/studio/live-room/:sessionId/pause
// ============================================================
router.post("/:sessionId/pause", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id || req.user._id;

    const session = await LiveRoomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    const isParticipant = 
      session.artistId.toString() === userId.toString() ||
      session.engineerId?.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ ok: false, error: "Only participants can pause the session" });
    }

    await session.pause();

    res.json({
      ok: true,
      message: "Session paused",
      session: {
        id: session._id,
        status: session.status,
      },
    });
  } catch (error) {
    console.error("Error pausing session:", error);
    res.status(500).json({ ok: false, error: "Failed to pause session" });
  }
});

// ============================================================
// RESUME A LIVE ROOM SESSION
// POST /api/studio/live-room/:sessionId/resume
// ============================================================
router.post("/:sessionId/resume", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id || req.user._id;

    const session = await LiveRoomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    const isParticipant = 
      session.artistId.toString() === userId.toString() ||
      session.engineerId?.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ ok: false, error: "Only participants can resume the session" });
    }

    await session.resume();

    res.json({
      ok: true,
      message: "Session resumed",
      session: {
        id: session._id,
        status: session.status,
      },
    });
  } catch (error) {
    console.error("Error resuming session:", error);
    res.status(500).json({ ok: false, error: "Failed to resume session" });
  }
});

// ============================================================
// END/COMPLETE A LIVE ROOM SESSION
// POST /api/studio/live-room/:sessionId/end
// ============================================================
router.post("/:sessionId/end", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id || req.user._id;

    const session = await LiveRoomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    const isParticipant = 
      session.artistId.toString() === userId.toString() ||
      session.engineerId?.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ ok: false, error: "Only participants can end the session" });
    }

    await session.complete();

    res.json({
      ok: true,
      message: "Session completed",
      session: {
        id: session._id,
        status: session.status,
        endedAt: session.endedAt,
        totalRecordingTime: session.totalRecordingTime,
        totalTracks: session.tracks.length,
      },
    });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ ok: false, error: "Failed to end session" });
  }
});

// ============================================================
// UPDATE TRACK (mark as selected, update notes, etc.)
// PATCH /api/studio/live-room/:sessionId/track/:trackId
// ============================================================
router.patch("/:sessionId/track/:trackId", requireAuth, async (req, res) => {
  try {
    const { sessionId, trackId } = req.params;
    const { isSelected, name, notes } = req.body;
    const userId = req.user.id || req.user._id;

    const session = await LiveRoomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    const isParticipant = 
      session.artistId.toString() === userId.toString() ||
      session.engineerId?.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ ok: false, error: "Only participants can update tracks" });
    }

    // Find and update the track
    const track = session.tracks.find(t => t.trackId === trackId);
    if (!track) {
      return res.status(404).json({ ok: false, error: "Track not found" });
    }

    if (typeof isSelected === "boolean") {
      // If selecting this track, deselect others of same type
      if (isSelected) {
        session.tracks.forEach(t => {
          if (t.type === track.type) t.isSelected = false;
        });
      }
      track.isSelected = isSelected;
    }

    if (name) track.name = name;
    if (notes !== undefined) track.notes = notes;

    await session.save();

    res.json({
      ok: true,
      message: "Track updated",
      track: {
        trackId: track.trackId,
        name: track.name,
        isSelected: track.isSelected,
        notes: track.notes,
      },
    });
  } catch (error) {
    console.error("Error updating track:", error);
    res.status(500).json({ ok: false, error: "Failed to update track" });
  }
});

// ============================================================
// DELETE A TRACK FROM SESSION
// DELETE /api/studio/live-room/:sessionId/track/:trackId
// ============================================================
router.delete("/:sessionId/track/:trackId", requireAuth, async (req, res) => {
  try {
    const { sessionId, trackId } = req.params;
    const userId = req.user.id || req.user._id;

    const session = await LiveRoomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    const isParticipant = 
      session.artistId.toString() === userId.toString() ||
      session.engineerId?.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ ok: false, error: "Only participants can delete tracks" });
    }

    const trackIndex = session.tracks.findIndex(t => t.trackId === trackId);
    if (trackIndex === -1) {
      return res.status(404).json({ ok: false, error: "Track not found" });
    }

    session.tracks.splice(trackIndex, 1);
    await session.save();

    res.json({
      ok: true,
      message: "Track deleted",
      remainingTracks: session.tracks.length,
    });
  } catch (error) {
    console.error("Error deleting track:", error);
    res.status(500).json({ ok: false, error: "Failed to delete track" });
  }
});

// ============================================================
// UPDATE SESSION SETTINGS
// PATCH /api/studio/live-room/:sessionId/settings
// ============================================================
router.patch("/:sessionId/settings", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { settings, beatUrl, beatName, beatId } = req.body;
    const userId = req.user.id || req.user._id;

    const session = await LiveRoomSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    const isParticipant = 
      session.artistId.toString() === userId.toString() ||
      session.engineerId?.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ ok: false, error: "Only participants can update settings" });
    }

    // Update settings
    if (settings) {
      Object.assign(session.settings, settings);
    }

    // Update beat
    if (beatUrl !== undefined) session.currentBeatUrl = beatUrl;
    if (beatName !== undefined) session.currentBeatName = beatName;
    if (beatId !== undefined) session.currentBeatId = beatId;

    await session.save();

    res.json({
      ok: true,
      message: "Settings updated",
      settings: session.settings,
      currentBeat: {
        id: session.currentBeatId,
        url: session.currentBeatUrl,
        name: session.currentBeatName,
      },
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ ok: false, error: "Failed to update settings" });
  }
});

export default router;

