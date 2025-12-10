// backend/src/domain/models/Post.model.js
// Canonical Post model for PowerStream
// Migrated from /backend/models/Post.js
import mongoose from "mongoose";

/**
 * Post channels (where content appears)
 */
export const POST_CHANNELS = {
  FEED: "feed",
  GRAM: "gram",
  REEL: "reel",
};

/**
 * Post types
 */
export const POST_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  STORY: "story",
  REEL: "reel",
  LIVE: "live",
};

/**
 * Post visibility
 */
export const POST_VISIBILITY = {
  PUBLIC: "public",
  FOLLOWERS: "followers",
  PRIVATE: "private",
};

const PostSchema = new mongoose.Schema(
  {
    // ============================================================
    // OWNERSHIP & CHANNEL
    // ============================================================
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true, 
      index: true 
    },
    channel: { 
      type: String, 
      enum: Object.values(POST_CHANNELS), 
      default: POST_CHANNELS.FEED, 
      index: true 
    },
    type: {
      type: String,
      enum: Object.values(POST_TYPES),
      default: POST_TYPES.TEXT,
    },
    visibility: {
      type: String,
      enum: Object.values(POST_VISIBILITY),
      default: POST_VISIBILITY.PUBLIC,
      index: true,
    },

    // ============================================================
    // CONTENT
    // ============================================================
    text: { type: String, default: "", maxlength: 5000 },
    caption: { type: String, default: "", maxlength: 2200 }, // For media posts
    
    // Media URLs
    mediaUrl: { type: String },           // Primary media (image/video)
    mediaType: { type: String, enum: ["image", "video", "audio", null] },
    thumbnailUrl: { type: String },       // Video thumbnail
    playbackUrl: { type: String },        // HLS playback URL
    
    // Multiple media support
    media: [{
      url: String,
      type: { type: String, enum: ["image", "video", "audio"] },
      width: Number,
      height: Number,
      duration: Number, // For video/audio
      thumbnailUrl: String,
    }],

    // ============================================================
    // ENGAGEMENT METRICS (denormalized for performance)
    // ============================================================
    likesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
    sharesCount: { type: Number, default: 0, min: 0 },
    savesCount: { type: Number, default: 0, min: 0 },
    viewsCount: { type: Number, default: 0, min: 0 },

    // ============================================================
    // METADATA
    // ============================================================
    hashtags: [{ type: String, index: true }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    location: {
      name: String,
      lat: Number,
      lng: Number,
    },

    // ============================================================
    // STATUS & FLAGS
    // ============================================================
    isPublished: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    isPromoted: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },

    // ============================================================
    // MODERATION
    // ============================================================
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "approved",
    },
    moderationNote: { type: String },
    reportCount: { type: Number, default: 0 },

    // ============================================================
    // SCHEDULING
    // ============================================================
    scheduledFor: { type: Date },
    publishedAt: { type: Date },
  },
  { 
    timestamps: true,
    collection: "posts",
  }
);

// ============================================================
// INDEXES
// ============================================================
PostSchema.index({ owner: 1, createdAt: -1 });
PostSchema.index({ channel: 1, createdAt: -1 });
PostSchema.index({ visibility: 1, isDeleted: 1, createdAt: -1 });
PostSchema.index({ hashtags: 1 });
PostSchema.index({ likesCount: -1, createdAt: -1 }); // For trending

// ============================================================
// VIRTUALS
// ============================================================
PostSchema.virtual("user", {
  ref: "User",
  localField: "owner",
  foreignField: "_id",
  justOne: true,
});

// ============================================================
// METHODS
// ============================================================

// Get engagement score (for ranking)
PostSchema.methods.getEngagementScore = function () {
  return (
    this.viewsCount * 1 +
    this.likesCount * 3 +
    this.commentsCount * 5 +
    this.sharesCount * 10 +
    this.savesCount * 4
  );
};

// Get post summary for lists
PostSchema.methods.getSummary = function () {
  return {
    id: this._id.toString(),
    owner: this.owner,
    channel: this.channel,
    type: this.type,
    text: this.text?.substring(0, 200),
    mediaUrl: this.mediaUrl,
    thumbnailUrl: this.thumbnailUrl,
    likesCount: this.likesCount,
    commentsCount: this.commentsCount,
    createdAt: this.createdAt,
  };
};

// ============================================================
// STATICS
// ============================================================

// Get feed posts for a user (from people they follow + their own)
PostSchema.statics.getFeedForUser = async function (userId, followingIds, options = {}) {
  const { limit = 20, skip = 0, channel } = options;
  
  const query = {
    owner: { $in: [...followingIds, userId] },
    isDeleted: false,
    visibility: POST_VISIBILITY.PUBLIC,
    isPublished: true,
  };
  
  if (channel) query.channel = channel;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("owner", "name username avatarUrl isVerified");
};

// Get trending posts
PostSchema.statics.getTrending = async function (channel, options = {}) {
  const { limit = 20, hours = 24 } = options;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const query = {
    createdAt: { $gte: since },
    isDeleted: false,
    visibility: POST_VISIBILITY.PUBLIC,
    isPublished: true,
  };
  
  if (channel) query.channel = channel;
  
  return this.find(query)
    .sort({ likesCount: -1, commentsCount: -1, viewsCount: -1 })
    .limit(limit)
    .populate("owner", "name username avatarUrl isVerified");
};

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;
export { PostSchema };



