// frontend/src/lib/studioClient.js
// ========================================================================
// RECORDING STUDIO CLIENT - Advanced Studio Features (Port 5100)
// ========================================================================
//
// This client specifically targets the Recording Studio server on port 5100.
// It provides "heavy" studio operations that require the dedicated server:
//
//   - Live recording session management
//   - FFmpeg-based mastering
//   - AI beat generation
//   - Real-time mixing
//   - Audio file exports with processing
//
// For simple operations (library reads, uploads, sessions), use studioApi.js
// which routes to the Main API on port 5001.
//
// ========================================================================

import axios from "axios";
import { getToken } from "../utils/auth.js";

// Recording Studio API (port 5100)
const STUDIO_API_BASE = import.meta.env.VITE_STUDIO_API_URL || "http://localhost:5100/api";

// Log configuration in dev mode only
if (import.meta.env.DEV) {
  console.log(`🎛️ [StudioClient] Recording Studio: ${STUDIO_API_BASE}`);
}

const studioClient = axios.create({
  baseURL: STUDIO_API_BASE,
  withCredentials: false,
  timeout: 60000, // 60s for audio processing
});

// Attach JWT token to all requests
studioClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// STUDIO STATUS
// ==========================================

let _isOnline = null;
let _checkPromise = null;

/**
 * Check if Recording Studio server is online
 * Result is cached for 30 seconds
 */
export async function isStudioOnline() {
  if (_isOnline !== null) return _isOnline;
  if (_checkPromise) return _checkPromise;

  _checkPromise = (async () => {
    try {
      await studioClient.get("/studio/health", { timeout: 3000 });
      _isOnline = true;
    } catch {
      _isOnline = false;
    }
    setTimeout(() => {
      _isOnline = null;
      _checkPromise = null;
    }, 30000);
    return _isOnline;
  })();

  return _checkPromise;
}

/**
 * Force recheck of studio status
 */
export function resetStudioStatus() {
  _isOnline = null;
  _checkPromise = null;
}

// ==========================================
// HEALTH CHECK
// ==========================================

/**
 * Check Recording Studio health (port 5100)
 * GET /api/studio/health
 */
export async function checkStudioHealth() {
  try {
    const res = await studioClient.get("/studio/health", { timeout: 5000 });
    return { success: true, online: true, data: res.data };
  } catch (err) {
    return { success: false, online: false, error: err.message, offline: true };
  }
}

// ==========================================
// RECORDING OPERATIONS
// ==========================================

/**
 * Start a recording session on the server
 * POST /api/studio/record/start
 * 
 * Note: Browser-based recording (MediaRecorder) doesn't require this.
 * This creates a server-side session for cloud saving.
 */
export async function startRecording(options = {}) {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, error: "Recording Studio offline" };
  }

  try {
    const { room = "vocal", projectName, beatId, beatUrl, settings } = options;
    const res = await studioClient.post("/studio/record/start", {
      room,
      projectName,
      beatId,
      beatUrl,
      settings,
    });
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

/**
 * Stop a recording session
 * POST /api/studio/record/stop
 */
export async function stopRecording(sessionId) {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, error: "Recording Studio offline" };
  }

  try {
    const res = await studioClient.post("/studio/record/stop", { sessionId });
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

/**
 * Upload a recorded take (audio blob) to the Recording Studio
 * POST /api/studio/record/upload
 */
export async function uploadRecordingTake(file, sessionId, takeNumber = 1, title = null) {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, error: "Recording Studio offline" };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);
    formData.append("takeNumber", String(takeNumber));
    if (title) formData.append("title", title);

    const res = await studioClient.post("/studio/record/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

/**
 * Get recording session details
 * GET /api/studio/record/:sessionId
 */
export async function getRecordingSession(sessionId) {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, error: "Recording Studio offline" };
  }

  try {
    const res = await studioClient.get(`/studio/record/${sessionId}`);
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

/**
 * List user's recording sessions
 * GET /api/studio/record
 */
export async function listRecordingSessions(limit = 20) {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, sessions: [], error: "Recording Studio offline" };
  }

  try {
    const res = await studioClient.get(`/studio/record?limit=${limit}`);
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, sessions: [], error: err.response?.data?.error || err.message };
  }
}

/**
 * Delete a recording take
 * DELETE /api/studio/record/take/:recordingId
 */
export async function deleteRecordingTake(recordingId) {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, error: "Recording Studio offline" };
  }

  try {
    const res = await studioClient.delete(`/studio/record/take/${recordingId}`);
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

// ==========================================
// BEAT GENERATION
// ==========================================

/**
 * Generate AI beat
 * POST /api/studio/ai/generate-beat
 */
export async function generateBeat(payload) {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, error: "AI Beat requires Recording Studio" };
  }

  try {
    const res = await studioClient.post("/studio/ai/generate-beat", payload);
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.message || "Beat generation failed" };
  }
}

// ==========================================
// MIXING & MASTERING
// ==========================================

/**
 * Activate studio session
 * POST /api/studio/activate
 */
export async function activateStudio() {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, error: "Recording Studio offline" };
  }

  try {
    const res = await studioClient.post("/studio/activate");
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Run mixing sequence
 * POST /api/studio/sequence
 */
export async function runMixingSequence(payload) {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, error: "Mixing requires Recording Studio" };
  }

  try {
    const res = await studioClient.post("/studio/sequence", payload);
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Master track with FFmpeg
 * POST /api/studio/ai/master/master
 */
export async function masterTrack(payload) {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, error: "Mastering requires Recording Studio (FFmpeg)" };
  }

  try {
    const res = await studioClient.post("/studio/ai/master/master", payload);
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// EXPORT
// ==========================================

/**
 * Export project (Recording Studio version)
 * POST /api/studio/export
 */
export async function exportProject(payload) {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, error: "Export requires Recording Studio" };
  }

  try {
    const res = await studioClient.post("/studio/export", payload);
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// LIBRARY (Recording Studio version)
// ==========================================

/**
 * Get library from Recording Studio
 * GET /api/library
 */
export async function getLibrary() {
  const online = await isStudioOnline();
  if (!online) {
    return { success: false, offline: true, items: [], error: "Recording Studio offline" };
  }

  try {
    const res = await studioClient.get("/library");
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, items: [], error: err.message };
  }
}

// ==========================================
// AUDIO PLAYBACK HELPER
// ==========================================

/**
 * Play an audio URL using HTML5 Audio
 * @param {string} url - The audio URL to play
 * @returns {HTMLAudioElement} - The audio element for control
 */
export function playAudio(url) {
  const audio = new Audio(url);
  audio.play().catch((err) => {
    console.warn("[StudioClient] Audio playback error:", err.message);
  });
  return audio;
}

// Export the axios client for direct use if needed
export default studioClient;
