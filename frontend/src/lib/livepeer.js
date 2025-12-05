// frontend/src/lib/livepeer.js
// Livepeer service for streaming integration

import { studioClient } from "./apiClient.js";

function extractErrorMessage(err, fallback = "Request failed") {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

// Livepeer service
export const livepeerService = {
  // NOTE: Stream lifecycle is now handled via streamApi + studioClient.
  // These helpers remain for backwards compatibility where imported.

  async startStream(params) {
    try {
      const { data } = await studioClient.post("/api/stream/start", params);
      return data;
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Failed to start stream"));
    }
  },

  async stopStream(sessionId) {
    try {
      const { data } = await studioClient.patch(`/api/stream/stop/${sessionId}`);
      return data;
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Failed to stop stream"));
    }
  },

  /**
   * Get all active streams
   * @returns {Promise<Array>} List of active streams (empty array on error)
   */
  async getActiveStreams() {
    try {
      const { getActiveStreams } = await import("./streamApi.js");
      return await getActiveStreams();
    } catch (err) {
      console.warn("Failed to get active streams:", err.message);
      return [];
    }
  },

  /**
   * Get active stream for a station
   * @param {string} stationId - Station ID
   * @returns {Promise<Object|null>} Active stream or null (null on error or 404)
   */
  async getActiveStreamForStation(stationId) {
    try {
      const { data } = await studioClient.get(
        `/api/stream/active/station/${stationId}`
      );
      if (!data || !data.ok) {
        return null;
      }
      return data.stream || null;
    } catch {
      return null;
    }
  },

  /**
   * Get encoder settings for a station (owners/admins only)
   * @param {string} stationId - Station ID
   * @returns {Promise<Object>} Encoder settings
   */
  async getStationEncoder(stationId) {
    try {
      const { data } = await studioClient.get(
        `/api/stations/${stationId}/encoder`
      );
      return data;
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Failed to get encoder settings"));
    }
  },

  buildHlsUrl(playbackId) {
    return getLivepeerPlaybackUrl(playbackId) || null;
  },

  normalizeHlsUrl(broadcastUrl) {
    if (!broadcastUrl) return null;
    // If already an HLS URL, return as-is
    if (broadcastUrl.includes(".m3u8")) return broadcastUrl;
    // If it's a playback ID, build HLS URL
    if (broadcastUrl.match(/^[a-zA-Z0-9-_]+$/)) {
      return this.buildHlsUrl(broadcastUrl);
    }
    // Otherwise assume it's already a full URL
    return broadcastUrl;
  },
};

/**
 * Small helper to build a Livepeer HLS playback URL from a playbackId.
 * Used by StreamPlayer and TV/Station components.
 */
export function getLivepeerPlaybackUrl(playbackId) {
  if (!playbackId) return "";
  return `https://livepeercdn.com/hls/${playbackId}/index.m3u8`;
}

export default livepeerService;

