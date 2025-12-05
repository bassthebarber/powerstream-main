// backend/src/domain/repositories/events.repository.js
// Event logging data access layer
import Event, { EVENT_TYPES, ENTITY_TYPES } from "../models/Event.model.js";
import { toObjectId } from "../../utils/ids.js";

/**
 * Events repository - handles event logging and analytics
 */
const eventsRepository = {
  /**
   * Log an event
   */
  async log(userId, type, entityType, entityId, options = {}) {
    return Event.log(
      toObjectId(userId),
      type,
      entityType,
      toObjectId(entityId),
      {
        targetUserId: options.targetUserId ? toObjectId(options.targetUserId) : undefined,
        metadata: options.metadata,
        clientInfo: options.clientInfo,
        duration: options.duration,
        value: options.value,
      }
    );
  },
  
  /**
   * Log a content view
   */
  async logView(userId, entityType, entityId, options = {}) {
    const viewTypes = {
      post: EVENT_TYPES.POST_VIEW,
      reel: EVENT_TYPES.REEL_VIEW,
      story: EVENT_TYPES.STORY_VIEW,
      user: EVENT_TYPES.PROFILE_VIEW,
      station: EVENT_TYPES.STATION_VIEW,
    };
    
    const type = viewTypes[entityType] || EVENT_TYPES.POST_VIEW;
    return this.log(userId, type, entityType, entityId, options);
  },
  
  /**
   * Log a like
   */
  async logLike(userId, entityType, entityId, targetUserId) {
    return this.log(userId, EVENT_TYPES.LIKE, entityType, entityId, { targetUserId });
  },
  
  /**
   * Log a comment
   */
  async logComment(userId, entityType, entityId, targetUserId, commentId) {
    return this.log(userId, EVENT_TYPES.COMMENT, entityType, entityId, {
      targetUserId,
      metadata: { commentId: commentId.toString() },
    });
  },
  
  /**
   * Log a follow
   */
  async logFollow(userId, targetUserId) {
    return this.log(userId, EVENT_TYPES.FOLLOW, ENTITY_TYPES.USER, targetUserId, {
      targetUserId,
    });
  },
  
  /**
   * Log a coin tip
   */
  async logCoinTip(userId, targetUserId, amount, entityType, entityId) {
    return this.log(userId, EVENT_TYPES.COIN_TIP, entityType, entityId, {
      targetUserId,
      value: amount,
    });
  },
  
  /**
   * Get engagement stats for an entity
   */
  async getEngagementStats(entityType, entityId) {
    return Event.getEngagementStats(entityType, toObjectId(entityId));
  },
  
  /**
   * Get user activity
   */
  async getUserActivity(userId, limit = 50) {
    return Event.getUserActivity(toObjectId(userId), limit);
  },
  
  /**
   * Get trending content
   */
  async getTrending(entityType, hours = 24, limit = 20) {
    return Event.getTrending(entityType, hours, limit);
  },
  
  /**
   * Get user engagement metrics over time
   */
  async getUserMetrics(userId, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const pipeline = [
      {
        $match: {
          userId: toObjectId(userId),
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            type: "$type",
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.type",
          data: {
            $push: {
              date: "$_id.day",
              count: "$count",
            },
          },
          total: { $sum: "$count" },
        },
      },
    ];
    
    return Event.aggregate(pipeline);
  },
  
  /**
   * Get content performance metrics
   */
  async getContentMetrics(entityType, entityId) {
    const pipeline = [
      {
        $match: {
          entityType,
          entityId: toObjectId(entityId),
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
          totalDuration: { $sum: "$duration" },
          totalValue: { $sum: "$value" },
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          totalDuration: 1,
          totalValue: 1,
        },
      },
    ];
    
    const results = await Event.aggregate(pipeline);
    
    return results.reduce((acc, r) => {
      acc[r._id] = {
        count: r.count,
        uniqueUsers: r.uniqueUsers,
        totalDuration: r.totalDuration,
        totalValue: r.totalValue,
      };
      return acc;
    }, {});
  },
};

export default eventsRepository;

