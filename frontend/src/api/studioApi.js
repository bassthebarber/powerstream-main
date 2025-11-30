// frontend/src/api/studioApi.js
const API =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.host}`;

// Small helper to handle JSON/fetch errors
async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export async function listAssets() {
  return handle(fetch(`${API}/api/studio/assets`, { credentials: "include" }));
}

export async function deleteAsset(id) {
  return handle(
    fetch(`${API}/api/studio/assets/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    })
  );
}

export async function uploadToStudio(file, meta = {}) {
  const fd = new FormData();
  fd.append("file", file);
  Object.entries(meta).forEach(([k, v]) => fd.append(k, v));
  return handle(
    fetch(`${API}/api/studio/upload`, {
      method: "POST",
      body: fd,
      credentials: "include",
    })
  );
}

export async function aiMix(trackId, options = {}) {
  return handle(
    fetch(`${API}/api/studio/mix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ trackId, ...options }),
    })
  );
}

export async function aiMaster(trackId, options = {}) {
  return handle(
    fetch(`${API}/api/studio/master`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ trackId, ...options }),
    })
  );
}

export async function requestExport(trackId, format = "wav") {
  return handle(
    fetch(`${API}/api/studio/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ trackId, format }),
    })
  );
}
