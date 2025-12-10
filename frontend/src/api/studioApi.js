// frontend/src/api/studioApi.js
// Studio API Client - All studio endpoints use /api/studio/* on the main backend
import { getToken } from "../utils/auth.js";

// Use main API URL - studio endpoints are at /api/studio/*
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
// ASSETS & LIBRARY
// ============================================

export async function listAssets() {
  return handle(fetch(`${STUDIO_API}/assets`, { 
    credentials: "include",
    headers: getAuthHeaders()
  }));
}

export async function deleteAsset(id) {
  return handle(
    fetch(`${STUDIO_API}/assets/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
      headers: getAuthHeaders()
    })
  );
}

export async function getLibraryItems(type, limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (type) params.append("type", type);
  return handle(fetch(`${STUDIO_API}/library/all?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// UPLOADS
// ============================================

export async function uploadToStudio(file, meta = {}) {
  const fd = new FormData();
  fd.append("file", file);
  Object.entries(meta).forEach(([k, v]) => fd.append(k, v));
  return handle(
    fetch(`${STUDIO_API}/upload`, {
      method: "POST",
      body: fd,
      credentials: "include",
      headers: getAuthHeaders()
    })
  );
}

// ============================================
// MIX & MASTER
// ============================================

export async function aiMix(trackId, options = {}) {
  return handle(
    fetch(`${STUDIO_API}/mix/apply`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      credentials: "include",
      body: JSON.stringify({ trackId, ...options }),
    })
  );
}

export async function aiMaster(trackId, options = {}) {
  return handle(
    fetch(`${STUDIO_API}/master/apply`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      credentials: "include",
      body: JSON.stringify({ trackId, ...options }),
    })
  );
}

// ============================================
// EXPORT
// ============================================

export async function requestExport(trackId, format = "wav") {
  return handle(
    fetch(`${STUDIO_API}/export`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      credentials: "include",
      body: JSON.stringify({ trackId, format }),
    })
  );
}

// ============================================
// BEATS
// ============================================

export async function getBeats(options = {}) {
  const params = new URLSearchParams();
  if (options.genre) params.append("genre", options.genre);
  if (options.mood) params.append("mood", options.mood);
  if (options.limit) params.append("limit", String(options.limit));
  
  return handle(fetch(`${STUDIO_API}/beats?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

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

// ============================================
// HEALTH CHECK
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

// Export default object for convenience
export default {
  listAssets,
  deleteAsset,
  getLibraryItems,
  uploadToStudio,
  aiMix,
  aiMaster,
  requestExport,
  getBeats,
  generateBeat,
  checkStudioHealth,
};
