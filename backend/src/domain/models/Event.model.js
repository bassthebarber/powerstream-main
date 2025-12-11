// backend/src/domain/models/Event.model.js
// Unified event log for analytics, engagement tracking, and ML features
import mongoose from "mongoose";

/**
 * Event types for the platform
 * Used for analytics, recommendations, and engagement tracking
 */
export const EVENT_TYPES = {
  // Content views
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
  UNSAVE: "unsave",
  
  // Social
  FOLLOW: "follow",
  UNFOLLOW: "unfollow",
  BLOCK: "block",
  UNBLOCK: "unblock",
  MESSAGE_SENT: "message_sent",
  
  // Monetization
  COIN_TIP: "coin_tip",
  SUBSCRIPTION_START: "subscription_start",
  SUBSCRIPTION_END: "subscription_end",
  PURCHASE: "purchase",
  
  // Streaming
  STREAM_START: "stream_start",
  STREAM_END: "stream_end",
  STREAM_JOIN: "stream_join",
  STREAM_LEAVE: "stream_leave",
  
  // Studio
  TRACK_UPLOAD: "track_upload",
  BEAT_GENERATE: "beat_generate",
  MIX_EXPORT: "mix_export",
  
  // Auth
  LOGIN: "login",
  LOGOUT: "logout",
  SIGNUP: "signup",
  PASSWORD_RESET: "password_reset",
  
  // Moderation
  REPORT: "report",
  CONTENT_FLAG: "content_flag",
};

export const ENTITY_TYPES = {
  POST: "post",
  REEL: "reel",
  STORY: "story",
  COMMENT: "comment",
  USER: "user",
  STATION: "station",
  STREAM: "stream",
  MESSAGE: "message",
  TRACK: "track",
  BEAT: "beat",
  MIX: "mix",
  SUBSCRIPTION: "subscription",
  TRANSACTION: "transaction",
};

const EventSchema = new mongoose.Schema(
  {
    // Who performed the action
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    // What type of action
    type: {
      type: String,
      required: true,
      enum: Object.values(EVENT_TYPES),
      index: true,
    },
    
    // What entity was affected
    entityType: {
      type: String,
      required: true,
      enum: Object.values(ENTITY_TYPES),
      index: true,
    },
    
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    
    // Target user (for social actions like follow, message)
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    
    // Additional data for the event
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Client info for analytics
    clientInfo: {
      ip: String,
      userAgent: String,
      platform: { type: String, enum: ["web", "ios", "android", "unknown"], default: "unknown" },
      referrer: String,
    },
    
    // Duration (for views)
    duration: {
      type: Number,
      default: 0,
    },
    
    // Value (for monetary events)
    value: {
      type: Number,
      default: 0,
    },
    
    // Processing status
    processedAt: Date,
    
    // Aggregation helpers
    hour: Number,
    day: Number,
    week: Number,
    month: Number,
    year: Number,
  },
  {
    timestamps: true,
    collection: "events",
  }
);

// Compound indexes for common queries
EventSchema.index({ userId: 1, type: 1, createdAt: -1 });
EventSchema.index({ entityType: 1, entityId: 1, type: 1 });
EventSchema.index({ targetUserId: 1, type: 1, createdAt: -1 });
EventSchema.index({ type: 1, createdAt: -1 });
EventSchema.index({ createdAt: -1 });

// TTL index - auto-delete events older than 90 days (optional)
// EventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Pre-save middleware to set time aggregation fields
EventSchema.pre("save", function (next) {
  const date = this.createdAt || new Date();
  this.hour = date.getHours();
  this.day = date.getDate();
  this.week = Math.ceil((date.getDate() + date.getDay()) / 7);
  this.month = date.getMonth() + 1;
  this.year = date.getFullYear();
  next();
});

// Static methods
EventSchema.statics = {
  /**
   * Log an event
   */
  async log(userId, type, entityType, entityId, options = {}) {
    return this.create({
      userId,
      type,
      entityType,
      entityId,
      targetUserId: options.targetUserId,
      metadata: options.metadata || {},
      clientInfo: options.clientInfo || {},
      duration: options.duration || 0,
      value: options.value || 0,
    });
  },
  
  /**
   * Get engagement stats for an entity
   */
  async getEngagementStats(entityType, entityId) {
    const stats = await this.aggregate([
      { $match: { entityType, entityId: new mongoose.Types.ObjectId(entityId) } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);
    
    return stats.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});
  },
  
  /**
   * Get recent activity for a user
   */
  async getUserActivity(userId, limit = 50) {
    return this.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },
  
  /**
   * Get trending content (most engaged in last X hours)
   */
  async getTrending(entityType, hours = 24, limit = 20) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return this.aggregate([
      {
        $match: {
          entityType,
          createdAt: { $gte: since },
          type: { $in: [EVENT_TYPES.LIKE, EVENT_TYPES.COMMENT, EVENT_TYPES.SHARE, EVENT_TYPES.POST_VIEW] },
        },
      },
      {
        $group: {
          _id: "$entityId",
          score: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ["$type", EVENT_TYPES.LIKE] }, then: 3 },
                  { case: { $eq: ["$type", EVENT_TYPES.COMMENT] }, then: 5 },
                  { case: { $eq: ["$type", EVENT_TYPES.SHARE] }, then: 10 },
                  { case: { $eq: ["$type", EVENT_TYPES.POST_VIEW] }, then: 1 },
                ],
                default: 1,
              },
            },
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit },
    ]);
  },
};

export default mongoose.model("Event", EventSchema);



