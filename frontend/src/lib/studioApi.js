// frontend/src/lib/studioApi.js
// Studio API Client - Unified client for all /api/studio/* endpoints
// Uses the MAIN backend server (not the standalone Recording Studio server)

import { getToken } from "../utils/auth.js";

// Use main API URL - all studio endpoints are at /api/studio/*
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";
const STUDIO_API = `${API_BASE}/api/studio`;

console.log("[StudioApi] Connecting to:", STUDIO_API);

// Helper to handle JSON/fetch errors
async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// Get auth headers
function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============================================
// HEALTH & STATUS
// ============================================

export async function checkStudioHealth() {
  try {
    const res = await fetch(`${STUDIO_API}/health`);
    const data = await res.json();
    console.log("[StudioApi] Health check:", data);
    return { ok: true, ...data };
  } catch (err) {
    console.error("[StudioApi] Health check failed:", err.message);
    return { ok: false, error: err.message };
  }
}

// ============================================
// LIBRARY
// ============================================

export async function getLibraryItems(type, limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (type) params.append("type", type);
  return handle(fetch(`${STUDIO_API}/library/all?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getRecordings(limit = 50) {
  return handle(fetch(`${STUDIO_API}/library/recordings?limit=${limit}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getMixes(limit = 50) {
  return handle(fetch(`${STUDIO_API}/library/mixes?limit=${limit}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getLibraryStats() {
  return handle(fetch(`${STUDIO_API}/library/stats`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// BEATS
// ============================================

export async function getBeats(options = {}) {
  const params = new URLSearchParams();
  if (options.genre) params.append("genre", options.genre);
  if (options.mood) params.append("mood", options.mood);
  if (options.bpmMin) params.append("bpmMin", String(options.bpmMin));
  if (options.bpmMax) params.append("bpmMax", String(options.bpmMax));
  if (options.limit) params.append("limit", String(options.limit));
  if (options.search) params.append("search", options.search);
  
  return handle(fetch(`${STUDIO_API}/beats?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getBeatById(id) {
  return handle(fetch(`${STUDIO_API}/beats/${id}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function useBeatForRecording(id) {
  return handle(fetch(`${STUDIO_API}/beats/${id}/use`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function saveBeat(beatData) {
  return handle(fetch(`${STUDIO_API}/beats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(beatData),
  }));
}

// ============================================
// AI BEAT GENERATION
// ============================================

export async function generateBeat(options = {}) {
  return handle(fetch(`${STUDIO_API}/ai/generate-beat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

export async function getBeatGenerationOptions() {
  return handle(fetch(`${STUDIO_API}/ai/options`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function generateBeatWithPreset(presetName, options = {}) {
  return handle(fetch(`${STUDIO_API}/ai/preset/${presetName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

// ============================================
// RECORDING
// ============================================

export async function startRecordingSession(options = {}) {
  return handle(fetch(`${STUDIO_API}/record/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

export async function stopRecordingSession(sessionId) {
  return handle(fetch(`${STUDIO_API}/record/stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ sessionId }),
  }));
}

export async function uploadRecording(file, sessionId, takeNumber, title) {
  const formData = new FormData();
  formData.append("file", file);
  if (sessionId) formData.append("sessionId", sessionId);
  if (takeNumber) formData.append("takeNumber", String(takeNumber));
  if (title) formData.append("title", title);
  
  return handle(fetch(`${STUDIO_API}/record/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: formData,
  }));
}

export async function getRecordingSessions(limit = 20) {
  return handle(fetch(`${STUDIO_API}/record?limit=${limit}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getRecordingSession(sessionId) {
  return handle(fetch(`${STUDIO_API}/record/${sessionId}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// UPLOAD
// ============================================

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  return handle(fetch(`${STUDIO_API}/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: formData,
  }));
}

export async function uploadMultipleFiles(files) {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  
  return handle(fetch(`${STUDIO_API}/upload/multiple`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: formData,
  }));
}

// ============================================
// MIX ENGINE
// ============================================

export async function applyMix(audioUrl, settings, projectName) {
  return handle(fetch(`${STUDIO_API}/mix/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ audioUrl, settings, projectName }),
  }));
}

export async function combineVocalAndBeat(vocalUrl, beatUrl, options = {}) {
  return handle(fetch(`${STUDIO_API}/mix/combine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ vocalUrl, beatUrl, ...options }),
  }));
}

export async function getAIMixRecipe(genre, mood) {
  return handle(fetch(`${STUDIO_API}/mix/ai-recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ genre, mood }),
  }));
}

export async function getMixList(limit = 20) {
  return handle(fetch(`${STUDIO_API}/mix/list?limit=${limit}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// MASTERING
// ============================================

export async function applyMaster(audioUrl, preset = "streaming", settings = {}) {
  return handle(fetch(`${STUDIO_API}/master/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ audioUrl, preset, settings }),
  }));
}

export async function getMasteringPresets() {
  return handle(fetch(`${STUDIO_API}/master/presets`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function masterRecording(recordingId, preset = "streaming") {
  return handle(fetch(`${STUDIO_API}/master/recording`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ recordingId, preset }),
  }));
}

// ============================================
// SESSIONS
// ============================================

export async function saveSession(sessionData) {
  return handle(fetch(`${STUDIO_API}/session/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(sessionData),
  }));
}

export async function loadSession(sessionId) {
  return handle(fetch(`${STUDIO_API}/session/${sessionId}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function listSessions(type, limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (type) params.append("type", type);
  return handle(fetch(`${STUDIO_API}/session?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// LIVE ROOM
// ============================================

export async function createLiveRoom(options = {}) {
  return handle(fetch(`${STUDIO_API}/live-room/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

export async function joinLiveRoom(roomCode) {
  return handle(fetch(`${STUDIO_API}/live-room/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ roomCode }),
  }));
}

export async function getLiveRoom(sessionId) {
  return handle(fetch(`${STUDIO_API}/live-room/${sessionId}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getLiveRooms(status, limit = 20) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (status) params.append("status", status);
  return handle(fetch(`${STUDIO_API}/live-room?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// JOBS & CONTRACTS
// ============================================

export async function getJobPricing() {
  return handle(fetch(`${STUDIO_API}/jobs/pricing`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function createJob(jobData) {
  return handle(fetch(`${STUDIO_API}/jobs/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(jobData),
  }));
}

export async function getMyJobs(options = {}) {
  const params = new URLSearchParams();
  if (options.status) params.append("status", options.status);
  if (options.type) params.append("type", options.type);
  if (options.limit) params.append("limit", String(options.limit));
  return handle(fetch(`${STUDIO_API}/jobs/my-jobs?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getOpenJobs(options = {}) {
  const params = new URLSearchParams();
  if (options.type) params.append("type", options.type);
  if (options.limit) params.append("limit", String(options.limit));
  return handle(fetch(`${STUDIO_API}/jobs/open?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// ROYALTIES
// ============================================

export async function getRoyalties() {
  return handle(fetch(`${STUDIO_API}/royalties`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function createRoyaltySplit(splitData) {
  return handle(fetch(`${STUDIO_API}/royalties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(splitData),
  }));
}

// ============================================
// TV EXPORT
// ============================================

export async function createTVExport(exportData) {
  return handle(fetch(`${STUDIO_API}/tv/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(exportData),
  }));
}

export async function getTVExports(options = {}) {
  const params = new URLSearchParams();
  if (options.status) params.append("status", options.status);
  if (options.station) params.append("station", options.station);
  if (options.limit) params.append("limit", String(options.limit));
  return handle(fetch(`${STUDIO_API}/tv/exports?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getTVStations() {
  return handle(fetch(`${STUDIO_API}/tv/stations`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// VOICE CLONE
// ============================================

export async function createVoiceProfile(profileData) {
  return handle(fetch(`${STUDIO_API}/voice/create-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(profileData),
  }));
}

export async function getMyVoiceProfile() {
  return handle(fetch(`${STUDIO_API}/voice/my-profile`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function synthesizeVoice(options) {
  return handle(fetch(`${STUDIO_API}/voice/synthesize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

// ============================================
// DASHBOARD
// ============================================

export async function getStudioSummary() {
  return handle(fetch(`${STUDIO_API}/dashboard/summary`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// LEGACY ALIASES (for backward compatibility)
// ============================================

// Alias for getLibraryItems - used by StudioLibraryPage
export async function getLibrary(options = {}) {
  const params = new URLSearchParams();
  if (options.type) params.append("type", options.type);
  if (options.limit) params.append("limit", String(options.limit));
  return handle(fetch(`${STUDIO_API}/library/all?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// Alias for getAIMixRecipe - used by StudioMixPage
export async function getAIRecipe(options = {}) {
  return handle(fetch(`${STUDIO_API}/mix/ai-recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

// Export default object for convenience
export default {
  checkStudioHealth,
  getLibraryItems,
  getRecordings,
  getMixes,
  getLibraryStats,
  getBeats,
  getBeatById,
  useBeatForRecording,
  saveBeat,
  generateBeat,
  getBeatGenerationOptions,
  generateBeatWithPreset,
  startRecordingSession,
  stopRecordingSession,
  uploadRecording,
  getRecordingSessions,
  getRecordingSession,
  uploadFile,
  uploadMultipleFiles,
  applyMix,
  combineVocalAndBeat,
  getAIMixRecipe,
  getMixList,
  applyMaster,
  getMasteringPresets,
  masterRecording,
  saveSession,
  loadSession,
  listSessions,
  createLiveRoom,
  joinLiveRoom,
  getLiveRoom,
  getLiveRooms,
  getJobPricing,
  createJob,
  getMyJobs,
  getOpenJobs,
  getRoyalties,
  createRoyaltySplit,
  createTVExport,
  getTVExports,
  getTVStations,
  createVoiceProfile,
  getMyVoiceProfile,
  synthesizeVoice,
  getStudioSummary,
  // Legacy aliases
  getLibrary,
  getAIRecipe,
};
