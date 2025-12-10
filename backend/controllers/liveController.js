// controllers/liveController.js (ESM)
// Live streaming controller with multistream RTMP fan-out support

import { authRequired } from "../middleware/requireAuth.js";
import MultistreamService from "../services/MultistreamService.js";
import { getRTMPIngestUrl } from "../services/StreamingServer.js";

// Simple in-memory state to avoid DB deps during boot
let LIVE_STATUS = {
  isLive: false,
  streamKey: null,
  sessionId: null,
  startedAt: null,
  updatedAt: new Date().toISOString(),
};

export const health = (req, res) => {
  return res.json({ ok: true, service: 'live-controller', time: new Date().toISOString() });
};

export const getStatus = async (req, res) => {
  try {
    // Get multistream status if session exists
    let multistreamStatus = null;
    if (LIVE_STATUS.sessionId) {
      multistreamStatus = MultistreamService.getMultistreamStatus(LIVE_STATUS.sessionId);
    }

    return res.json({
      ...LIVE_STATUS,
      multistream: multistreamStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.json({ ...LIVE_STATUS, updatedAt: new Date().toISOString() });
  }
};

export const startStream = async (req, res) => {
  try {
    const {
      streamKey,
      title = "Untitled Stream",
      description = "",
      stationId,
      useMultistream = true,
      profileId,
      selectedEndpoints,
      recordingEnabled,
    } = req.body || {};
    const userId = req.user?.id;

    if (!streamKey) {
      return res.status(400).json({ ok: false, error: "streamKey is required" });
    }

    // Generate session ID
    const sessionId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build input RTMP URL (from NodeMediaServer)
    const inputRtmpUrl = getRTMPIngestUrl(streamKey);

    // Start multistream fan-out if enabled and user is authenticated
    let multistreamResult = null;
    if (useMultistream && userId) {
      try {
        multistreamResult = await MultistreamService.startMultistream(sessionId, inputRtmpUrl, userId, {
          stationId,
          profileId,
          selectedEndpoints,
          enableRecording: recordingEnabled,
        });
        console.log(`[Live] Multistream started:`, multistreamResult);
      } catch (msError) {
        console.error(`[Live] Multistream error (non-fatal):`, msError);
        // Continue with stream even if multistream fails
      }
    }

    LIVE_STATUS = {
      isLive: true,
      streamKey,
      sessionId,
      title,
      description,
      stationId,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      multistream: multistreamResult,
      recordingEnabled: recordingEnabled || false,
    };

    return res.status(201).json({
      ok: true,
      message: 'Stream started',
      ...LIVE_STATUS,
    });
  } catch (error) {
    console.error('[Live] Error starting stream:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to start stream',
    });
  }
};

export const stopStream = async (req, res) => {
  try {
    const { sessionId } = req.body || LIVE_STATUS.sessionId;

    // Stop multistream if active
    if (sessionId) {
      try {
        await MultistreamService.stopMultistream(sessionId);
        console.log(`[Live] Multistream stopped for session ${sessionId}`);
      } catch (msError) {
        console.error(`[Live] Error stopping multistream:`, msError);
      }
    }

    LIVE_STATUS = {
      ...LIVE_STATUS,
      isLive: false,
      updatedAt: new Date().toISOString(),
    };

    return res.json({
      ok: true,
      message: 'Stream stopped',
      ...LIVE_STATUS,
    });
  } catch (error) {
    console.error('[Live] Error stopping stream:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to stop stream',
    });
  }
};

// Aliases to match different route files you may already have:
export const createLive = startStream;
export const createLiveStream = startStream;
export const endLive = stopStream;
export const endLiveStream = stopStream;
export const status = getStatus;
export const liveHealth = health;

// Default export (covers `import liveController from ...`)
const liveController = {
  health,
  liveHealth,
  getStatus,
  status,
  startStream,
  stopStream,
  createLive,
  createLiveStream,
  endLive,
  endLiveStream,
};
export default liveController;
