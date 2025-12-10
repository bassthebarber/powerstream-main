// frontend/src/components/tv/global/ViewTracker.js
// Universal TV View Tracker - Tracks views and triggers payouts

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

// Session storage key prefix
const VIEW_TRACKED_PREFIX = "tv_view_tracked_";

/**
 * Track a video view
 * Only tracks once per session per video to prevent spam
 * 
 * @param {Object} params
 * @param {string} params.stationId - Station ID
 * @param {string} params.videoId - Video ID
 * @param {string} params.viewerUserId - Optional viewer user ID
 * @param {number} params.watchDuration - Watch duration in seconds
 * @returns {Promise<Object>} { success, views, totalEarnings, qualifiedView }
 */
export async function trackView({ 
  stationId, 
  videoId, 
  viewerUserId = null,
  watchDuration = 0,
}) {
  if (!stationId || !videoId) {
    console.error("[ViewTracker] stationId and videoId are required");
    return { success: false, error: "Missing required parameters" };
  }

  // Check if already tracked in this session
  const trackKey = `${VIEW_TRACKED_PREFIX}${videoId}`;
  const alreadyTracked = sessionStorage.getItem(trackKey);

  if (alreadyTracked && watchDuration < 30) {
    // Only allow re-tracking if watch duration is significant (>30s)
    // This allows qualified view upgrades
    console.log("[ViewTracker] View already tracked for this session");
    return { success: true, alreadyTracked: true };
  }

  try {
    const res = await fetch(`${API_BASE}/api/tv/engagement/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stationId,
        videoId,
        viewerUserId,
        watchDuration,
      }),
    });

    const data = await res.json();

    if (data.success) {
      // Mark as tracked in session
      sessionStorage.setItem(trackKey, JSON.stringify({
        trackedAt: Date.now(),
        watchDuration,
        qualifiedView: data.qualifiedView,
      }));

      console.log(`[ViewTracker] View tracked: ${data.views} total, qualified: ${data.qualifiedView}`);
    }

    return data;
  } catch (err) {
    console.error("[ViewTracker] Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Track view on first play
 * Call this when video starts playing
 */
export function trackViewOnPlay(stationId, videoId, viewerUserId = null) {
  // Track with 0 duration initially
  trackView({ stationId, videoId, viewerUserId, watchDuration: 0 });
}

/**
 * Update view with watch duration
 * Call this periodically or when video pauses/ends
 */
export function updateViewDuration(stationId, videoId, watchDuration, viewerUserId = null) {
  // Only update if duration is significant (qualified view threshold)
  if (watchDuration >= 30) {
    trackView({ stationId, videoId, viewerUserId, watchDuration });
  }
}

/**
 * Check if view has been tracked for this video in current session
 */
export function isViewTracked(videoId) {
  const trackKey = `${VIEW_TRACKED_PREFIX}${videoId}`;
  return !!sessionStorage.getItem(trackKey);
}

/**
 * Get tracked view info for a video
 */
export function getTrackedViewInfo(videoId) {
  const trackKey = `${VIEW_TRACKED_PREFIX}${videoId}`;
  const data = sessionStorage.getItem(trackKey);
  return data ? JSON.parse(data) : null;
}

/**
 * Clear view tracking for a video (for testing)
 */
export function clearViewTracking(videoId) {
  const trackKey = `${VIEW_TRACKED_PREFIX}${videoId}`;
  sessionStorage.removeItem(trackKey);
}

/**
 * Clear all view tracking (for testing)
 */
export function clearAllViewTracking() {
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith(VIEW_TRACKED_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  });
}

/**
 * React Hook for view tracking
 * Use in video player components
 */
export function useViewTracker(stationId, videoId, viewerUserId = null) {
  let tracked = false;
  let watchStart = null;

  const onPlay = () => {
    if (!tracked) {
      watchStart = Date.now();
      trackViewOnPlay(stationId, videoId, viewerUserId);
      tracked = true;
    }
  };

  const onPause = () => {
    if (watchStart) {
      const duration = Math.floor((Date.now() - watchStart) / 1000);
      updateViewDuration(stationId, videoId, duration, viewerUserId);
    }
  };

  const onEnded = () => {
    if (watchStart) {
      const duration = Math.floor((Date.now() - watchStart) / 1000);
      updateViewDuration(stationId, videoId, duration, viewerUserId);
    }
  };

  const onTimeUpdate = (currentTime) => {
    // Update every 30 seconds of watch time
    if (currentTime > 0 && currentTime % 30 === 0) {
      updateViewDuration(stationId, videoId, currentTime, viewerUserId);
    }
  };

  return {
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    isTracked: () => isViewTracked(videoId),
  };
}

export default {
  trackView,
  trackViewOnPlay,
  updateViewDuration,
  isViewTracked,
  getTrackedViewInfo,
  clearViewTracking,
  clearAllViewTracking,
  useViewTracker,
};


