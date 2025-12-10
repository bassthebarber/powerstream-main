// frontend/src/api/studioApi.js
// Studio API Client - Recording Studio server (port 5100)
import { getToken } from "../utils/auth.js";

const STUDIO_API = import.meta.env.VITE_STUDIO_API_URL || "http://localhost:5100/api";

console.log("[StudioApi] Connecting to:", STUDIO_API);

// Small helper to handle JSON/fetch errors
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

export async function listAssets() {
  return handle(fetch(`${STUDIO_API}/studio/assets`, { 
    credentials: "include",
    headers: getAuthHeaders()
  }));
}

export async function deleteAsset(id) {
  return handle(
    fetch(`${STUDIO_API}/studio/assets/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
      headers: getAuthHeaders()
    })
  );
}

export async function uploadToStudio(file, meta = {}) {
  const fd = new FormData();
  fd.append("file", file);
  Object.entries(meta).forEach(([k, v]) => fd.append(k, v));
  return handle(
    fetch(`${STUDIO_API}/studio/upload`, {
      method: "POST",
      body: fd,
      credentials: "include",
      headers: getAuthHeaders()
    })
  );
}

export async function aiMix(trackId, options = {}) {
  return handle(
    fetch(`${STUDIO_API}/studio/mix`, {
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
    fetch(`${STUDIO_API}/studio/master`, {
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

export async function requestExport(trackId, format = "wav") {
  return handle(
    fetch(`${STUDIO_API}/studio/export`, {
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

export async function checkStudioHealth() {
  try {
    const res = await fetch(`${STUDIO_API}/studio/health`);
    const data = await res.json();
    console.log("[StudioApi] Health check:", data);
    return { ok: true, ...data };
  } catch (err) {
    console.error("[StudioApi] Health check failed:", err.message);
    return { ok: false, error: err.message };
  }
}
