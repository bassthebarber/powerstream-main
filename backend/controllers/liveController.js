// controllers/liveController.js (ESM)

//
// Minimal, safe handlers so your server boots now.
// You can wire real Livepeer/FFmpeg logic later without changing routes.
//

// Simple in-memory state to avoid DB deps during boot
let LIVE_STATUS = {
  isLive: false,
  streamKey: null,
  startedAt: null,
  updatedAt: new Date().toISOString(),
};

export const health = (req, res) => {
  return res.json({ ok: true, service: 'live-controller', time: new Date().toISOString() });
};

export const getStatus = (req, res) => {
  return res.json({ ...LIVE_STATUS, updatedAt: new Date().toISOString() });
};

export const startStream = (req, res) => {
  const { streamKey = 'dev-key', title = 'Untitled Stream' } = req.body || {};
  LIVE_STATUS = {
    isLive: true,
    streamKey,
    title,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return res.status(201).json({ message: 'Stream started', ...LIVE_STATUS });
};

export const stopStream = (req, res) => {
  LIVE_STATUS = {
    ...LIVE_STATUS,
    isLive: false,
    updatedAt: new Date().toISOString(),
  };
  return res.json({ message: 'Stream stopped', ...LIVE_STATUS });
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
