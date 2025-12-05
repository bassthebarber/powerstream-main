// frontend/src/lib/streamApi.js
// Frontend helper for live stream lifecycle calls (Main backend)

import api from "./api.js";

function toFriendlyError(err, fallback) {
  const offline =
    err?.code === "ECONNABORTED" ||
    err?.message?.includes("NetworkError") ||
    err?.message?.includes("Failed to fetch") ||
    !err?.response;
  if (offline) {
    return new Error(
      "Studio API is offline – check that it is running on http://localhost:5100 and your .env URLs are correct."
    );
  }
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback;
  return new Error(msg);
}

/**
 * Start a new live stream
 * @param {Object} payload - { surface, stationId?, title, description, useMultistream, platforms[] }
 * @returns {Promise<Object>} Stream session info
 */
export async function startStream(payload) {
  try {
    const { data } = await api.post("/live/start", payload);
    return data;
  } catch (err) {
    throw toFriendlyError(err, "Unable to start stream.");
  }
}

/**
 * Stop a live stream
 * @param {string} sessionId - Stream session ID
 * @returns {Promise<Object>} Stop result
 */
export async function stopStream(sessionId) {
  try {
    const { data } = await api.post("/live/stop", { sessionId });
    return data;
  } catch (err) {
    throw toFriendlyError(err, "Unable to stop stream.");
  }
}

/**
 * Get all currently active streams
 * @returns {Promise<Array>} Array of active stream sessions
 */
export async function getActiveStreams() {
  try {
    // Fallback: use main API status if studio stream API is not available
    const { data } = await api.get("/live/status");
    return data ? [data] : [];
  } catch (err) {
    console.warn("Failed to load active streams", err);
    return [];
  }
}

// Fetch VOD assets for a station
export async function fetchVODAssets(stationId, limit = 20) {
  try {
    const params = { limit };
    if (stationId) params.stationId = stationId;
    const { data } = await api.get("/vod", { params });
    return data;
  } catch (err) {
    throw toFriendlyError(err, "Unable to load VOD assets.");
  }
}

export default {
  startStream,
  stopStream,
  getActiveStreams,
};


