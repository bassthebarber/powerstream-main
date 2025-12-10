// frontend/src/api/eventsApi.js
// Client-side event logging API
import httpClient from "./httpClient.js";

/**
 * Event types for client-side logging
 */
export const EVENT_TYPES = {
  // Views
  POST_VIEW: "post_view",
  VIDEO_VIEW: "video_view",
  REEL_VIEW: "reel_view",
  STORY_VIEW: "story_view",
  PROFILE_VIEW: "profile_view",
  STATION_VIEW: "station_view",
  
  // Engagement
  LIKE: "like",
  UNLIKE: "unlike",
  COMMENT: "comment",
  SHARE: "share",
  SAVE: "save",
  
  // Social
  FOLLOW: "follow",
  UNFOLLOW: "unfollow",
  
  // Monetization
  COIN_TIP: "coin_tip",
  
  // Streaming
  STREAM_JOIN: "stream_join",
  STREAM_LEAVE: "stream_leave",
  
  // Navigation
  PAGE_VIEW: "page_view",
  SEARCH: "search",
  
  // Feature usage
  FEATURE_USE: "feature_use",
};

/**
 * Entity types
 */
export const ENTITY_TYPES = {
  POST: "post",
  REEL: "reel",
  STORY: "story",
  USER: "user",
  STATION: "station",
  STREAM: "stream",
  MESSAGE: "message",
};

/**
 * Events API
 * Client-side event logging for analytics and recommendations
 */
const eventsApi = {
  /**
   * Log a client event
   */
  async logEvent(type, entityType, entityId, metadata = {}) {
    try {
      const response = await httpClient.post("/events", {
        type,
        entityType,
        entityId,
        metadata,
        clientInfo: {
          platform: "web",
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        },
      });
      return response.data;
    } catch (error) {
      // Silently fail for events - don't disrupt user experience
      console.debug("Event logging failed:", error.message);
      return null;
    }
  },

  /**
   * Log a view event
   */
  async logView(entityType, entityId, duration = 0) {
    const typeMap = {
      post: EVENT_TYPES.POST_VIEW,
      reel: EVENT_TYPES.REEL_VIEW,
      story: EVENT_TYPES.STORY_VIEW,
      user: EVENT_TYPES.PROFILE_VIEW,
      station: EVENT_TYPES.STATION_VIEW,
    };
    
    const eventType = typeMap[entityType] || EVENT_TYPES.POST_VIEW;
    return this.logEvent(eventType, entityType, entityId, { duration });
  },

  /**
   * Log a page view
   */
  async logPageView(path, metadata = {}) {
    return this.logEvent(EVENT_TYPES.PAGE_VIEW, "page", path, {
      ...metadata,
      path,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log a search event
   */
  async logSearch(query, resultCount = 0) {
    return this.logEvent(EVENT_TYPES.SEARCH, "search", query, {
      query,
      resultCount,
    });
  },

  /**
   * Log a stream join event
   */
  async logStreamJoin(stationId) {
    return this.logEvent(EVENT_TYPES.STREAM_JOIN, ENTITY_TYPES.STREAM, stationId);
  },

  /**
   * Log a stream leave event
   */
  async logStreamLeave(stationId, watchDuration = 0) {
    return this.logEvent(EVENT_TYPES.STREAM_LEAVE, ENTITY_TYPES.STREAM, stationId, {
      watchDuration,
    });
  },

  /**
   * Log a like event
   */
  async logLike(entityType, entityId) {
    return this.logEvent(EVENT_TYPES.LIKE, entityType, entityId);
  },

  /**
   * Log a share event
   */
  async logShare(entityType, entityId, platform = "internal") {
    return this.logEvent(EVENT_TYPES.SHARE, entityType, entityId, { platform });
  },

  /**
   * Log a follow event
   */
  async logFollow(targetUserId) {
    return this.logEvent(EVENT_TYPES.FOLLOW, ENTITY_TYPES.USER, targetUserId);
  },

  /**
   * Log feature usage
   */
  async logFeatureUse(featureName, metadata = {}) {
    return this.logEvent(EVENT_TYPES.FEATURE_USE, "feature", featureName, metadata);
  },

  /**
   * Batch log multiple events
   */
  async logBatch(events) {
    try {
      const response = await httpClient.post("/events/batch", { events });
      return response.data;
    } catch (error) {
      console.debug("Batch event logging failed:", error.message);
      return null;
    }
  },
};

export default eventsApi;




