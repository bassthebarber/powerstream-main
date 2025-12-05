// frontend/src/lib/streamHealth.js
// Unified streaming health checks for Studio backend

import { studioClient } from "./apiClient.js";

export async function checkStudioHealth() {
  try {
    const { data } = await studioClient.get("/api/health/stream");
    return { ok: true, data };
  } catch (err) {
    console.error("Studio health check failed", err);
    return {
      ok: false,
      error: err?.response?.data || err.message || "Studio health check failed",
    };
  }
}








