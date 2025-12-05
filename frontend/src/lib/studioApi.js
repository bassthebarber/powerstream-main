// frontend/src/lib/studioApi.js
// Unified Studio API Client - All Studio & PowerHarmony endpoints
import axios from "axios";
import { getToken } from "../utils/auth.js";

// Studio API runs on port 5100 (Recording Studio server)
const STUDIO_API_BASE = import.meta.env.VITE_STUDIO_API_URL || "http://localhost:5100/api";

const studioApi = axios.create({
  baseURL: STUDIO_API_BASE,
  withCredentials: false,
});

// Automatically attach JWT token to all requests
studioApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors
studioApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { clearToken } = await import("../utils/auth.js");
      clearToken();
    }
    return Promise.reject(error);
  }
);

// ==========================================
// BEAT LAB API
// ==========================================

/**
 * Generate AI beat
 * POST /api/beatlab/generate
 */
export async function generateBeat(payload) {
  const { data } = await studioApi.post("/beatlab/generate", {
    prompt: payload.prompt,
    bpm: payload.bpm,
    bars: payload.bars,
    style: payload.genre || payload.style,
    mood: payload.mood,
    temperature: payload.temperature,
    lengthSeconds: payload.bars ? payload.bars * 4 : 30, // Approximate: 4 seconds per bar
  });
  return data;
}

/**
 * Render loop (with BPM, bars, genres)
 * POST /api/beatlab/render
 */
export async function renderLoop(payload) {
  const { data } = await studioApi.post("/beatlab/generate", {
    bpm: payload.bpm,
    bars: payload.bars,
    style: payload.genres?.[0] || "trap",
    lengthSeconds: payload.bars * 4,
  });
  return data;
}

/**
 * Save beat to library
 * POST /api/beatlab/save
 */
export async function saveBeat(payload) {
  const { data } = await studioApi.post("/beatlab/save", {
    beatId: payload.beatId,
    title: payload.title,
    producer: payload.producer,
    metadata: payload.metadata,
  });
  return data;
}

/**
 * Evolve loop (mutate existing beat)
 * POST /api/beatlab/evolve
 */
export async function evolveLoop(payload) {
  const { data } = await studioApi.post("/beatlab/evolve", {
    beatId: payload.beatId,
    mutation: payload.mutation,
  });
  return data;
}

// ==========================================
// MIX & MASTER API
// ==========================================

/**
 * Apply mix settings (EQ, compression, etc.)
 * POST /api/mix/apply
 */
export async function applyMix(payload) {
  const { data } = await studioApi.post("/mix/apply", {
    trackId: payload.trackId,
    loopId: payload.loopId,
    mixId: payload.mixId,
    settings: {
      bass: payload.bass,
      mid: payload.mid,
      treble: payload.treble,
      presence: payload.presence,
      comp: payload.comp,
      limiter: payload.limiter,
    },
  });
  return data;
}

/**
 * Get AI recipe for mix
 * POST /api/mix/ai-recipe
 */
export async function getAIRecipe(payload) {
  const { data } = await studioApi.post("/mix/ai-recipe", {
    trackId: payload.trackId,
    loopId: payload.loopId,
    prompt: payload.prompt || payload.recipe,
  });
  return data;
}

/**
 * Download master
 * GET /api/mix/download/:mixId
 */
export async function downloadMaster(mixId) {
  const { data } = await studioApi.get(`/mix/download/${mixId}`, {
    responseType: "blob",
  });
  return data;
}

// ==========================================
// EXPORT & EMAIL API
// ==========================================

/**
 * Export project/session
 * POST /api/studio/export (Recording Studio API - port 5100)
 * This handles the actual export/rendering
 */
export async function exportProject(payload) {
  const { data } = await studioApi.post("/studio/export", {
    projectId: payload.projectId,
    mixId: payload.mixId,
    sessionId: payload.sessionId,
    format: payload.format || "mp3", // mp3, wav, stems
    version: payload.version || "master", // clean, explicit, tv, performance
    projectName: payload.projectName,
    userId: payload.userId,
  });
  return data;
}

/**
 * Send export via email
 * POST /api/export/email
 */
export async function sendExportEmail(payload) {
  const { data } = await studioApi.post("/export/email", {
    assetId: payload.assetId,
    assetName: payload.assetName,
    assetUrl: payload.assetUrl,
    email: payload.email,
    notes: payload.notes,
  });
  return data;
}

// ==========================================
// UPLOAD API
// ==========================================

/**
 * Upload file
 * POST /api/upload/file
 */
export async function uploadFile(file, metadata = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (metadata.publicId) formData.append("publicId", metadata.publicId);

  const { data } = await studioApi.post("/upload/file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

/**
 * Upload multiple files
 * POST /api/upload/multi
 */
export async function uploadFiles(files, metadata = {}) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  if (metadata.publicId) formData.append("publicId", metadata.publicId);

  const { data } = await studioApi.post("/upload/multi", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

// ==========================================
// LIBRARY API
// ==========================================

/**
 * Get library items (all types)
 * GET /api/library/all
 */
export async function getLibrary(filters = {}) {
  const { data } = await studioApi.get("/library/all", {
    params: {
      limit: filters.limit || 50,
      type: filters.type, // beat, recording, mixdown
    },
  });
  return data;
}

/**
 * Get beats from library
 * GET /api/library/beats
 */
export async function getBeats(filters = {}) {
  const { data } = await studioApi.get("/library/beats", {
    params: {
      limit: filters.limit || 50,
      genre: filters.genre,
      mood: filters.mood,
    },
  });
  return data;
}

/**
 * Get recordings from library
 * GET /api/library/recordings
 */
export async function getRecordings(filters = {}) {
  const { data } = await studioApi.get("/library/recordings", {
    params: {
      limit: filters.limit || 50,
      source: filters.source,
    },
  });
  return data;
}

/**
 * Get mixes from library
 * GET /api/library/mixes
 */
export async function getMixes(filters = {}) {
  const { data } = await studioApi.get("/library/mixes", {
    params: {
      limit: filters.limit || 50,
      status: filters.status,
    },
  });
  return data;
}

/**
 * Get library item by ID
 * GET /api/library/:type/:id
 */
export async function getLibraryItem(type, id) {
  const { data } = await studioApi.get(`/library/${type}/${id}`);
  return data;
}

// ==========================================
// ROYALTY API
// ==========================================

/**
 * Save royalty splits
 * POST /api/royalty/splits
 */
export async function saveRoyaltySplits(payload) {
  const { data } = await studioApi.post("/royalty/splits", {
    projectId: payload.projectId,
    participants: payload.participants, // [{ name, percentage }]
  });
  return data;
}

/**
 * Get royalty splits
 * GET /api/royalty/splits
 */
export async function getRoyaltySplits(projectId) {
  const { data } = await studioApi.get("/royalty/splits", {
    params: { projectId },
  });
  return data;
}

/**
 * Get royalty statements
 * GET /api/royalty/statements
 */
export async function getRoyaltyStatements(filters = {}) {
  const { data } = await studioApi.get("/royalty/statements", {
    params: {
      userId: filters.userId,
      projectId: filters.projectId,
      limit: filters.limit || 50,
    },
  });
  return data;
}

// ==========================================
// SESSION & PROJECT API
// ==========================================

/**
 * Save session/project
 * POST /api/studio/sessions/save (Main API - port 5001)
 */
export async function saveSession(payload) {
  // Use main API, not Recording Studio API
  const api = (await import("./api.js")).default;
  const { data } = await api.post("/studio/sessions/save", {
    sessionId: payload.sessionId,
    projectName: payload.projectName,
    type: payload.type, // beat, mix, recording, full
    data: payload.data, // Session state (bpm, fx, tracks, etc.)
  });
  return data;
}

/**
 * Load session
 * GET /api/studio/sessions/:id (Main API - port 5001)
 */
export async function loadSession(sessionId) {
  // Use main API, not Recording Studio API
  const api = (await import("./api.js")).default;
  const { data } = await api.get(`/studio/sessions/${sessionId}`);
  return data;
}

/**
 * List sessions
 * GET /api/studio/sessions (Main API - port 5001)
 */
export async function listSessions(filters = {}) {
  // Use main API, not Recording Studio API
  const api = (await import("./api.js")).default;
  const { data } = await api.get("/studio/sessions", {
    params: {
      type: filters.type,
      limit: filters.limit || 50,
    },
  });
  return data;
}

// ==========================================
// POWERHARMONY ROOMS API
// ==========================================

/**
 * Start recording session
 * POST /api/studio/record/start
 */
export async function startRecording(payload) {
  const { data } = await studioApi.post("/studio/record/start", {
    room: payload.room, // vocal, live, record
    projectId: payload.projectId,
    settings: payload.settings,
  });
  return data;
}

/**
 * Stop recording session
 * POST /api/studio/record/stop
 */
export async function stopRecording(sessionId) {
  const { data } = await studioApi.post("/studio/record/stop", {
    sessionId,
  });
  return data;
}

/**
 * Generate lyrics (AI)
 * POST /api/studio/lyrics/generate
 */
export async function generateLyrics(payload) {
  const { data } = await studioApi.post("/studio/lyrics/generate", {
    prompt: payload.prompt,
    style: payload.style,
    mood: payload.mood,
    length: payload.length, // bars or lines
  });
  return data;
}

/**
 * Apply mastering
 * POST /api/studio/master/apply
 */
export async function applyMastering(payload) {
  const { data } = await studioApi.post("/studio/master/apply", {
    trackId: payload.trackId,
    mixId: payload.mixId,
    settings: {
      loudness: payload.loudness,
      stereoWidth: payload.stereoWidth,
    },
  });
  return data;
}

// ==========================================
// HEALTH & STATUS
// ==========================================

/**
 * Check studio API health
 * GET /api/studio/health
 */
export async function checkStudioHealth() {
  try {
    const { data } = await studioApi.get("/studio/health");
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export default studioApi;


