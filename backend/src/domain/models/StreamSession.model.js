// backend/src/domain/models/StreamSession.model.js
// Canonical StreamSession model for live streaming
// Migrated from /backend/models/LiveSession.js
import mongoose from "mongoose";

/**
 * Stream session types
 */
export const SESSION_TYPES = {
  LIVE: "live",
  SCHEDULED: "scheduled",
  REPLAY: "replay",
  MULTISTREAM: "multistream",
};

/**
 * Stream session status
 */
export const SESSION_STATUS = {
  PENDING: "pending",
  LIVE: "live",
  ENDED: "ended",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

/**
 * Stream quality options
 */
export const STREAM_QUALITY = {
  SD: "480p",
  HD: "720p",
  FHD: "1080p",
  UHD: "4k",
};

const StreamSessionSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC INFO
    // ============================================================
    title: { type: String, default: "Live Stream" },
    description: { type: String, default: "" },
    thumbnailUrl: { type: String },
    
    // ============================================================
    // OWNERSHIP
    // ============================================================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      index: true,
    },
    
    // Legacy field for backwards compatibility
    artistName: { type: String },

    // ============================================================
    // STREAM CONFIG
    // ============================================================
    type: {
      type: String,
      enum: Object.values(SESSION_TYPES),
      default: SESSION_TYPES.LIVE,
    },
    streamKey: { type: String, required: true, index: true },
    streamPath: { type: String },
    
    // Ingest details
    ingest: {
      rtmpUrl: String,
      streamKey: String,
      playbackId: String,
      protocol: { type: String, default: "rtmp" },
    },
    
    // Playback URLs
    playbackUrl: { type: String },
    hlsUrl: { type: String },
    dashUrl: { type: String },

    // ============================================================
    // QUALITY & SETTINGS
    // ============================================================
    quality: {
      type: String,
      enum: Object.values(STREAM_QUALITY),
      default: STREAM_QUALITY.HD,
    },
    bitrate: { type: Number }, // kbps
    fps: { type: Number, default: 30 },
    codec: { type: String, default: "h264" },
    
    // Features
    enableChat: { type: Boolean, default: true },
    enableDVR: { type: Boolean, default: false },
    enableRecording: { type: Boolean, default: true },
    isPrivate: { type: Boolean, default: false },
    requireSubscription: { type: Boolean, default: false },

    // ============================================================
    // STATUS & TIMING
    // ============================================================
    status: {
      type: String,
      enum: Object.values(SESSION_STATUS),
      default: SESSION_STATUS.PENDING,
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    scheduledFor: { type: Date },
    duration: { type: Number, default: 0 }, // seconds

    // ============================================================
    // METRICS
    // ============================================================
    viewerCount: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    uniqueViewers: { type: Number, default: 0 },
    avgWatchTime: { type: Number, default: 0 }, // seconds
    
    // Engagement
    chatMessages: { type: Number, default: 0 },
    reactions: { type: Number, default: 0 },
    tips: { type: Number, default: 0 },
    tipsAmount: { type: Number, default: 0 },

    // ============================================================
    // RECORDING & VOD
    // ============================================================
    recording: {
      enabled: { type: Boolean, default: true },
      url: String,
      duration: Number,
      size: Number, // bytes
      vodId: { type: mongoose.Schema.Types.ObjectId, ref: "VODAsset" },
    },

    // ============================================================
    // MULTISTREAM
    // ============================================================
    multistream: {
      enabled: { type: Boolean, default: false },
      destinations: [{
        platform: { type: String, enum: ["youtube", "twitch", "facebook", "custom"] },
        rtmpUrl: String,
        streamKey: String,
        status: { type: String, default: "idle" },
      }],
    },

    // ============================================================
    // METADATA
    // ============================================================
    category: { type: String },
    tags: [String],
    language: { type: String, default: "en" },
    
    // Technical info (from encoder)
    encoder: {
      software: String,
      version: String,
      settings: mongoose.Schema.Types.Mixed,
    },
    
    // Client info
    clientInfo: {
      ip: String,
      userAgent: String,
      platform: String,
    },

    // ============================================================
    // ERROR TRACKING
    // ============================================================
    errors: [{
      timestamp: Date,
      code: String,
      message: String,
    }],
    lastError: {
      timestamp: Date,
      code: String,
      message: String,
    },
  },
  { 
    timestamps: true,
    collection: "stream_sessions",
  }
);

// ============================================================
// INDEXES
// ============================================================
StreamSessionSchema.index({ userId: 1, createdAt: -1 });
StreamSessionSchema.index({ stationId: 1, status: 1 });
StreamSessionSchema.index({ streamKey: 1 });
StreamSessionSchema.index({ status: 1, startedAt: -1 });
StreamSessionSchema.index({ category: 1, status: 1 });

// ============================================================
// METHODS
// ============================================================

// Start stream
StreamSessionSchema.methods.start = async function () {
  this.status = SESSION_STATUS.LIVE;
  this.startedAt = new Date();
  await this.save();
  return this;
};

// End stream
StreamSessionSchema.methods.end = async function () {
  this.status = SESSION_STATUS.ENDED;
  this.endedAt = new Date();
  this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  
  // Save peak viewers
  if (this.viewerCount > this.peakViewers) {
    this.peakViewers = this.viewerCount;
  }
  
  await this.save();
  return this;
};

// Update viewer count
StreamSessionSchema.methods.updateViewers = async function (count) {
  this.viewerCount = count;
  this.totalViews += 1;
  if (count > this.peakViewers) {
    this.peakViewers = count;
  }
  await this.save();
  return this;
};

// Add error
StreamSessionSchema.methods.addError = async function (code, message) {
  const error = { timestamp: new Date(), code, message };
  this.errors.push(error);
  this.lastError = error;
  await this.save();
  return this;
};

// Mark failed
StreamSessionSchema.methods.fail = async function (reason) {
  this.status = SESSION_STATUS.FAILED;
  this.endedAt = new Date();
  if (reason) {
    await this.addError("STREAM_FAILED", reason);
  }
  return this;
};

// Get session summary
StreamSessionSchema.methods.getSummary = function () {
  return {
    id: this._id.toString(),
    title: this.title,
    thumbnailUrl: this.thumbnailUrl,
    status: this.status,
    viewerCount: this.viewerCount,
    startedAt: this.startedAt,
    duration: this.duration,
    playbackUrl: this.playbackUrl,
  };
};

// ============================================================
// STATICS
// ============================================================

// Get active sessions
StreamSessionSchema.statics.getActiveSessions = async function (options = {}) {
  const { limit = 50, category, stationId } = options;
  
  const query = { status: SESSION_STATUS.LIVE };
  if (category) query.category = category;
  if (stationId) query.stationId = stationId;
  
  return this.find(query)
    .sort({ viewerCount: -1 })
    .limit(limit)
    .populate("userId", "name username avatarUrl")
    .populate("stationId", "name slug logoUrl");
};

// Get user's sessions
StreamSessionSchema.statics.getUserSessions = async function (userId, options = {}) {
  const { limit = 20, status } = options;
  
  const query = { userId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Find by stream key
StreamSessionSchema.statics.findByStreamKey = function (streamKey) {
  return this.findOne({ streamKey, status: { $in: [SESSION_STATUS.PENDING, SESSION_STATUS.LIVE] } });
};

// Get analytics for a period
StreamSessionSchema.statics.getAnalytics = async function (userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: "$duration" },
        totalViews: { $sum: "$totalViews" },
        avgViewers: { $avg: "$peakViewers" },
        totalTips: { $sum: "$tipsAmount" },
      },
    },
  ]);
};

const StreamSession = mongoose.models.StreamSession || mongoose.model("StreamSession", StreamSessionSchema);

// Export alias for backwards compatibility
export const LiveSession = StreamSession;

export default StreamSession;
export { StreamSessionSchema };

