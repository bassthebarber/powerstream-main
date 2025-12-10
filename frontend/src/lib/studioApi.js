// frontend/src/lib/studioApi.js
// ========================================================================
// UNIFIED STUDIO API CLIENT - PowerHarmony & Recording Studio
// ========================================================================
//
// This file manages API calls for the Studio features.
//
// PORT ROUTING:
// -------------
// PORT 5001 (Main API - always running):
//   - /api/studio/library     → Library reads (beats, recordings, masters)
//   - /api/studio/sessions    → Session management (save, load, list)
//   - /api/studio/health      → Health check
//   - /api/upload             → File uploads (Cloudinary)
//
// PORT 5100 (Recording Studio - optional, for advanced features):
//   - /api/studio/record/*    → Live recording session management
//   - /api/studio/master/*    → FFmpeg-based mastering
//   - /api/studio/export      → Real export/bounce
//   - /api/mix/*              → Mixing engine
//   - /api/beatlab/*          → AI beat generation
//   - /api/library/*          → Recording Studio library (advanced)
//   - /api/studio/tv/*        → TV station export
//
// ========================================================================

import axios from "axios";
import { getToken } from "../utils/auth.js";

// ==========================================
// API CLIENTS
// ==========================================

// Force localhost in development mode
const isDev = import.meta.env.MODE === "development" || 
              window.location.hostname === "localhost" || 
              window.location.hostname === "127.0.0.1";

// Main API (port 5001) - Always available
const MAIN_API_BASE = isDev 
  ? "http://localhost:5001/api" 
  : (import.meta.env.VITE_API_URL || "http://localhost:5001/api");

// Recording Studio API (port 5100) - For advanced features (optional)
const STUDIO_API_BASE = isDev
  ? "http://localhost:5100/api"
  : (import.meta.env.VITE_STUDIO_API_URL || "http://localhost:5100/api");

// Main API client (port 5001)
const mainApi = axios.create({
  baseURL: MAIN_API_BASE,
  withCredentials: false,
  timeout: 30000,
});

// Recording Studio client (port 5100)
const studioApi = axios.create({
  baseURL: STUDIO_API_BASE,
  withCredentials: false,
  timeout: 60000, // Longer timeout for audio processing
});

// Attach JWT token to all requests
const attachToken = (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

mainApi.interceptors.request.use(attachToken, (err) => Promise.reject(err));
studioApi.interceptors.request.use(attachToken, (err) => Promise.reject(err));

// Handle 401 errors
const handle401 = async (error) => {
  if (error.response?.status === 401) {
    const { clearToken } = await import("../utils/auth.js");
    clearToken();
  }
  return Promise.reject(error);
};

mainApi.interceptors.response.use((res) => res, handle401);
studioApi.interceptors.response.use((res) => res, handle401);

// Dev logging
if (import.meta.env.DEV) {
  console.log(`🎛️ [Studio APIs] Main: ${MAIN_API_BASE} | Recording: ${STUDIO_API_BASE}`);
}

// ==========================================
// RECORDING STUDIO STATUS TRACKING
// ==========================================

let _studioOnline = null;
let _studioCheckPromise = null;

/**
 * Check if Recording Studio server (5100) is online
 * Caches result for 30 seconds
 */
export async function isRecordingStudioOnline() {
  if (_studioOnline !== null) return _studioOnline;
  if (_studioCheckPromise) return _studioCheckPromise;

  _studioCheckPromise = (async () => {
    try {
      await studioApi.get("/studio/health", { timeout: 3000 });
      _studioOnline = true;
    } catch {
      _studioOnline = false;
    }
    // Reset cache after 30s
    setTimeout(() => {
      _studioOnline = null;
      _studioCheckPromise = null;
    }, 30000);
    return _studioOnline;
  })();

  return _studioCheckPromise;
}

/**
 * Reset the studio online check (useful after server start)
 */
export function resetStudioOnlineCheck() {
  _studioOnline = null;
  _studioCheckPromise = null;
}

// ==========================================
// HEALTH CHECKS
// ==========================================

/**
 * Check main API health (port 5001)
 * GET /api/studio/health
 */
export async function checkMainApiHealth() {
  try {
    const { data } = await mainApi.get("/studio/health");
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message, offline: true };
  }
}

/**
 * Check Recording Studio health (port 5100)
 * GET /api/studio/health
 */
export async function checkStudioHealth() {
  try {
    const { data } = await studioApi.get("/studio/health", { timeout: 5000 });
    return { ok: true, online: true, ...data };
  } catch (error) {
    return { ok: false, online: false, error: error.message, offline: true };
  }
}

/**
 * Check both APIs and return combined status
 */
export async function checkAllStudioHealth() {
  const [main, studio] = await Promise.all([
    checkMainApiHealth(),
    checkStudioHealth(),
  ]);
  return {
    mainApi: main,
    recordingStudio: studio,
    fullyOperational: main.ok && studio.ok,
  };
}

// ==========================================
// LIBRARY API (Main API - port 5001)
// These routes work even if Recording Studio is offline
// ==========================================

/**
 * Get library items (all types)
 * GET /api/studio/library (Main API)
 */
export async function getLibrary(filters = {}) {
  try {
    const { data } = await mainApi.get("/studio/library", {
      params: {
        tab: filters.type || filters.tab,
        limit: filters.limit || 50,
        skip: filters.skip || 0,
        sort: filters.sort || "newest",
      },
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message, items: [] };
  }
}

/**
 * Get beats from library
 * GET /api/studio/library?tab=beats (Main API)
 */
export async function getBeats(filters = {}) {
  return getLibrary({ ...filters, type: "beats" });
}

/**
 * Get recordings from library
 * GET /api/studio/library?tab=recordings (Main API)
 */
export async function getRecordings(filters = {}) {
  return getLibrary({ ...filters, type: "recordings" });
}

/**
 * Get mixes/masters from library
 * GET /api/studio/library?tab=masters (Main API)
 */
export async function getMixes(filters = {}) {
  return getLibrary({ ...filters, type: "masters" });
}

// ==========================================
// SESSION API (Main API - port 5001)
// ==========================================

/**
 * Save session/project
 * POST /api/studio/sessions/save (Main API)
 */
export async function saveSession(payload) {
  try {
    const { data } = await mainApi.post("/studio/sessions/save", {
      sessionId: payload.sessionId,
      projectName: payload.projectName,
      type: payload.type,
      data: payload.data,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Load session
 * GET /api/studio/sessions/:id (Main API)
 */
export async function loadSession(sessionId) {
  try {
    const { data } = await mainApi.get(`/studio/sessions/${sessionId}`);
    return { ok: true, ...data };
  } catch (error) {
    if (error.response?.status === 404) {
      return { ok: false, code: "NOT_FOUND", message: "Session not found." };
    }
    return { ok: false, error: error.message };
  }
}

/**
 * List sessions
 * GET /api/studio/sessions (Main API)
 */
export async function listSessions(filters = {}) {
  try {
    const { data } = await mainApi.get("/studio/sessions", {
      params: {
        type: filters.type,
        limit: filters.limit || 50,
      },
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message, sessions: [] };
  }
}

/**
 * Get last session for current user
 * GET /api/studio/sessions/last (Main API)
 */
export async function getLastSession() {
  try {
    const { data } = await mainApi.get("/studio/sessions/last");
    return { ok: true, ...data };
  } catch (error) {
    if (error.response?.status === 404) {
      return { ok: false, code: "NO_SESSIONS", message: "No previous sessions found." };
    }
    return { ok: false, error: error.message };
  }
}

// ==========================================
// UPLOAD API (Main API - port 5001)
// ==========================================

/**
 * Upload file to Cloudinary
 * POST /api/upload (Main API)
 */
export async function uploadFile(file, metadata = {}) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata.publicId) formData.append("publicId", metadata.publicId);
    if (metadata.type) formData.append("type", metadata.type);
    if (metadata.name) formData.append("name", metadata.name);

    const { data } = await mainApi.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000, // 5 min for large files
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`[Upload] Progress: ${percent}% (${(progressEvent.loaded / 1024 / 1024).toFixed(1)}MB)`);
      },
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Upload multiple files
 * POST /api/upload/multi (Main API)
 */
export async function uploadFiles(files, metadata = {}) {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (metadata.publicId) formData.append("publicId", metadata.publicId);

    const { data } = await mainApi.post("/upload/multi", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000, // 5 min for large files
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// ==========================================
// EXPORT API (Main API with fallback)
// ==========================================

/**
 * Export project - Real implementation
 * Uses Main API's export endpoint
 * POST /api/studio/export (Main API)
 */
export async function exportProject(payload) {
  try {
    const { data } = await mainApi.post("/studio/export", {
      projectId: payload.projectId,
      recordingId: payload.recordingId,
      audioUrl: payload.audioUrl,
      mixId: payload.mixId,
      sessionId: payload.sessionId,
      format: payload.format || "mp3",
      version: payload.version || "master",
      projectName: payload.projectName,
      userId: payload.userId,
    });
    return { ok: true, success: true, ...data };
  } catch (error) {
    return { ok: false, success: false, error: error.message };
  }
}

/**
 * Send export via email
 * POST /api/studio/export/email (Main API)
 */
export async function sendExportEmail(payload) {
  try {
    const { data } = await mainApi.post("/studio/export/email", {
      assetId: payload.assetId,
      assetName: payload.assetName,
      assetUrl: payload.assetUrl,
      email: payload.email,
      notes: payload.notes,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// ==========================================
// RECORDING STUDIO API (port 5100)
// These require the Recording Studio server to be running
// ==========================================

/**
 * Start recording session (Recording Studio - port 5100)
 * POST /api/studio/record/start
 */
export async function startRecording(payload) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Recording Studio is offline. Recording uses browser only.", offlineMode: true };
  }

  try {
    const { data } = await studioApi.post("/studio/record/start", {
      room: payload.room,
      projectId: payload.projectId,
      projectName: payload.projectName,
      beatId: payload.beatId,
      beatUrl: payload.beatUrl,
      settings: payload.settings,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Stop recording session (Recording Studio - port 5100)
 * POST /api/studio/record/stop
 */
export async function stopRecording(sessionId) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Recording Studio offline", offlineMode: true };
  }

  try {
    const { data } = await studioApi.post("/studio/record/stop", { sessionId });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Upload recording take (Recording Studio - port 5100)
 * POST /api/studio/record/upload
 */
export async function uploadRecordingTake(file, sessionId, takeNumber = 1, title = null) {
  const online = await isRecordingStudioOnline();
  
  // Fallback to main API if Recording Studio is offline
  if (!online) {
    return uploadFile(file, { type: "recording", name: title || `Take ${takeNumber}` });
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);
    formData.append("takeNumber", String(takeNumber));
    if (title) formData.append("title", title);

    const { data } = await studioApi.post("/studio/record/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return { ok: true, ...data };
  } catch (error) {
    // Fallback to main API
    return uploadFile(file, { type: "recording", name: title || `Take ${takeNumber}` });
  }
}

// ==========================================
// BEAT LAB API (Recording Studio - port 5100)
// ==========================================

/**
 * Generate AI beat (Recording Studio - port 5100)
 * POST /api/beatlab/generate
 */
export async function generateBeat(payload) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "AI Beat Generation requires Recording Studio server", offlineMode: true };
  }

  try {
    const { data } = await studioApi.post("/beatlab/generate", {
      prompt: payload.prompt,
      bpm: payload.bpm,
      bars: payload.bars,
      style: payload.genre || payload.style,
      mood: payload.mood,
      temperature: payload.temperature,
      lengthSeconds: payload.bars ? payload.bars * 4 : 30,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Render loop (Recording Studio - port 5100)
 * POST /api/beatlab/generate
 */
export async function renderLoop(payload) {
  return generateBeat({
    bpm: payload.bpm,
    bars: payload.bars,
    style: payload.genres?.[0] || "trap",
  });
}

/**
 * Save beat to library (Recording Studio - port 5100)
 * POST /api/beatlab/save
 */
export async function saveBeat(payload) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Recording Studio offline", offlineMode: true };
  }

  try {
    const { data } = await studioApi.post("/beatlab/save", {
      beatId: payload.beatId,
      title: payload.title,
      producer: payload.producer,
      metadata: payload.metadata,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Evolve loop (Recording Studio - port 5100)
 * POST /api/beatlab/evolve
 */
export async function evolveLoop(payload) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Recording Studio offline", offlineMode: true };
  }

  try {
    const { data } = await studioApi.post("/beatlab/evolve", {
      beatId: payload.beatId,
      mutation: payload.mutation,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// ==========================================
// MIX & MASTER API (Recording Studio - port 5100)
// ==========================================

/**
 * Apply mix settings (Recording Studio - port 5100)
 * POST /api/mix/apply
 */
export async function applyMix(payload) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Mixing requires Recording Studio server", offlineMode: true };
  }

  if (!payload.audioUrl && !payload.file) {
    return { ok: false, error: "applyMix requires either audioUrl or file" };
  }

  const settings = {
    bass: payload.bass ?? payload.settings?.bass ?? 0,
    mid: payload.mid ?? payload.settings?.mid ?? 0,
    treble: payload.treble ?? payload.settings?.treble ?? 0,
    presence: payload.presence ?? payload.settings?.presence ?? 0,
    comp: payload.comp ?? payload.settings?.comp ?? 2,
    limiter: payload.limiter ?? payload.settings?.limiter ?? -1,
    volume: payload.volume ?? payload.settings?.volume ?? 0,
  };

  try {
    const { data } = await studioApi.post("/mix/apply", {
      audioUrl: payload.audioUrl,
      projectName: payload.projectName || `Mix ${new Date().toLocaleString()}`,
      settings,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Combine vocal and beat into a mix (Recording Studio - port 5100)
 * POST /api/mix/combine
 */
export async function combineMix(payload) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Mixing requires Recording Studio server", offlineMode: true };
  }

  if (!payload.vocalUrl && !payload.beatUrl) {
    return { ok: false, error: "combineMix requires vocalUrl or beatUrl" };
  }

  try {
    const { data } = await studioApi.post("/mix/combine", {
      vocalUrl: payload.vocalUrl,
      beatUrl: payload.beatUrl,
      vocalLevel: payload.vocalLevel ?? -3,
      beatLevel: payload.beatLevel ?? -6,
      projectName: payload.projectName || `Combined Mix ${new Date().toLocaleString()}`,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Get AI recipe for mix (Recording Studio - port 5100)
 * POST /api/mix/ai-recipe
 */
export async function getAIRecipe(payload) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "AI features require Recording Studio server", offlineMode: true };
  }

  try {
    const { data } = await studioApi.post("/mix/ai-recipe", {
      genre: payload.genre,
      mood: payload.mood,
      referenceTrack: payload.referenceTrack,
      prompt: payload.prompt || payload.recipe,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Get list of user's mixes (Recording Studio - port 5100)
 * GET /api/mix/list
 */
export async function getMixList(limit = 20) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    // Fallback to main API library
    return getMixes({ limit });
  }

  try {
    const { data } = await studioApi.get("/mix/list", { params: { limit } });
    return { ok: true, ...data };
  } catch (error) {
    return getMixes({ limit });
  }
}

/**
 * Apply mastering (Recording Studio - port 5100)
 * POST /api/studio/master/apply
 */
export async function applyMastering(payload) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Mastering requires Recording Studio server (FFmpeg)", offlineMode: true };
  }

  if (!payload.audioUrl && !payload.file && !payload.mixId) {
    return { ok: false, error: "applyMastering requires audioUrl, file, or mixId" };
  }

  const settings = {};
  ["loudness", "truePeak", "stereoWidth", "lra", "bassEnhance", "airBoost", "warmth"].forEach((key) => {
    const val = payload[key] ?? payload.settings?.[key];
    if (val !== undefined) settings[key] = val;
  });

  try {
    const { data } = await studioApi.post("/studio/master/apply", {
      audioUrl: payload.audioUrl,
      preset: payload.preset || "streaming",
      projectName: payload.projectName || `Master ${new Date().toLocaleString()}`,
      settings: Object.keys(settings).length > 0 ? settings : undefined,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Get mastering presets (Recording Studio - port 5100)
 * GET /api/studio/master/presets
 */
export async function getMasteringPresets() {
  const online = await isRecordingStudioOnline();
  if (!online) {
    // Return default presets for offline mode
    return {
      ok: true,
      offlineMode: true,
      presets: [
        { id: "streaming", name: "Streaming (Spotify/Apple)", loudness: -14 },
        { id: "club", name: "Club/DJ", loudness: -9 },
        { id: "broadcast", name: "Broadcast (TV/Radio)", loudness: -24 },
        { id: "cd", name: "CD Quality", loudness: -11 },
        { id: "loud", name: "Maximum Loudness", loudness: -6 },
        { id: "vinyl", name: "Vinyl Prep", loudness: -16 },
      ],
    };
  }

  try {
    const { data } = await studioApi.get("/studio/master/presets");
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Generate lyrics (AI) (Recording Studio - port 5100)
 * POST /api/studio/lyrics/generate
 */
export async function generateLyrics(payload) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "AI Lyrics requires Recording Studio server", offlineMode: true };
  }

  try {
    const { data } = await studioApi.post("/studio/lyrics/generate", {
      prompt: payload.prompt,
      style: payload.style,
      mood: payload.mood,
      length: payload.length,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// ==========================================
// ROYALTY API (Recording Studio - port 5100)
// ==========================================

/**
 * Save royalty splits (Recording Studio - port 5100)
 * POST /api/royalty/splits
 */
export async function saveRoyaltySplits(payload) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Royalty features require Recording Studio server", offlineMode: true };
  }

  try {
    const { data } = await studioApi.post("/royalty/splits", {
      projectId: payload.projectId,
      participants: payload.participants,
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Get royalty splits (Recording Studio - port 5100)
 * GET /api/royalty/splits
 */
export async function getRoyaltySplits(projectId) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Royalty features require Recording Studio server", offlineMode: true };
  }

  try {
    const { data } = await studioApi.get("/royalty/splits", { params: { projectId } });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Get royalty statements (Recording Studio - port 5100)
 * GET /api/royalty/statements
 */
export async function getRoyaltyStatements(filters = {}) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Royalty features require Recording Studio server", offlineMode: true, statements: [] };
  }

  try {
    const { data } = await studioApi.get("/royalty/statements", {
      params: {
        userId: filters.userId,
        projectId: filters.projectId,
        limit: filters.limit || 50,
      },
    });
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message, statements: [] };
  }
}

// ==========================================
// ADVANCED LIBRARY (Recording Studio - port 5100)
// ==========================================

/**
 * Get library item by ID (Recording Studio - port 5100)
 * GET /api/library/:type/:id
 */
export async function getLibraryItem(type, id) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Item details require Recording Studio server", offlineMode: true };
  }

  try {
    const { data } = await studioApi.get(`/library/${type}/${id}`);
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Download mix file (Recording Studio - port 5100)
 * GET /api/mix/download/:filename
 */
export async function downloadMix(filename) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Download requires Recording Studio server", offlineMode: true };
  }

  try {
    const { data } = await studioApi.get(`/mix/download/${filename}`, {
      responseType: "blob",
    });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Download mastered file (Recording Studio - port 5100)
 * GET /api/studio/master/download/:filename
 */
export async function downloadMaster(filename) {
  const online = await isRecordingStudioOnline();
  if (!online) {
    return { ok: false, error: "Download requires Recording Studio server", offlineMode: true };
  }

  try {
    const { data } = await studioApi.get(`/studio/master/download/${filename}`, {
      responseType: "blob",
    });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// Export the API clients for direct use if needed
export { mainApi, studioApi };
export default studioApi;
