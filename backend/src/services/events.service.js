// backend/src/services/events.service.js
// Event logging service layer
import eventsRepository from "../domain/repositories/events.repository.js";
import { logEvent as queueLogEvent } from "../loaders/jobs.js";
import { logger } from "../config/logger.js";
import { EVENT_TYPES, ENTITY_TYPES } from "../domain/models/Event.model.js";

/**
 * Events service - handles all event logging
 * Uses queue for async processing when available
 */
const eventsService = {
  // Re-export event types for convenience
  EVENT_TYPES,
  ENTITY_TYPES,
  
  /**
   * Log an event (async, non-blocking)
   */
  async logEvent(userId, type, entityType, entityId, options = {}) {
    try {
      // Try to queue the event first
      const queued = await queueLogEvent(userId, type, entityType, entityId, options.metadata);
      
      if (!queued) {
        // Fallback to direct logging if queue unavailable
        await eventsRepository.log(userId, type, entityType, entityId, options);
      }
      
      return true;
    } catch (err) {
      logger.error("Event logging failed:", err.message);
      return false;
    }
  },
  
  /**
   * Log a content view
   */
  async logView(userId, entityType, entityId, options = {}) {
    return eventsRepository.logView(userId, entityType, entityId, options);
  },
  
  /**
   * Log a like action
   */
  async logLike(userId, entityType, entityId, ownerId) {
    return eventsRepository.logLike(userId, entityType, entityId, ownerId);
  },
  
  /**
   * Log a comment action
   */
  async logComment(userId, entityType, entityId, ownerId, commentId) {
    return eventsRepository.logComment(userId, entityType, entityId, ownerId, commentId);
  },
  
  /**
   * Log a share action
   */
  async logShare(userId, entityType, entityId, options = {}) {
    return this.logEvent(userId, EVENT_TYPES.SHARE, entityType, entityId, options);
  },
  
  /**
   * Log a follow action
   */
  async logFollow(userId, targetUserId) {
    return eventsRepository.logFollow(userId, targetUserId);
  },
  
  /**
   * Log a coin tip
   */
  async logCoinTip(userId, targetUserId, amount, entityType, entityId) {
    return eventsRepository.logCoinTip(userId, targetUserId, amount, entityType, entityId);
  },
  
  /**
   * Get engagement stats for content
   */
  async getEngagementStats(entityType, entityId) {
    return eventsRepository.getEngagementStats(entityType, entityId);
  },
  
  /**
   * Get user activity feed
   */
  async getUserActivity(userId, limit = 50) {
    return eventsRepository.getUserActivity(userId, limit);
  },
  
  /**
   * Get trending content
   */
  async getTrending(entityType, hours = 24, limit = 20) {
    return eventsRepository.getTrending(entityType, hours, limit);
  },
  
  /**
   * Get user analytics
   */
  async getUserAnalytics(userId, days = 30) {
    return eventsRepository.getUserMetrics(userId, days);
  },
  
  /**
   * Get content performance
   */
  async getContentPerformance(entityType, entityId) {
    return eventsRepository.getContentMetrics(entityType, entityId);
  },
};

export default eventsService;

