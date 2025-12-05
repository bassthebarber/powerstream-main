// backend/src/domain/models/Station.model.js
// Canonical Station model for PowerStream TV
// Migrated from /backend/models/Station.js
import mongoose from "mongoose";

/**
 * Station categories
 */
export const STATION_CATEGORIES = {
  MUSIC: "music",
  SPORTS: "sports",
  NEWS: "news",
  ENTERTAINMENT: "entertainment",
  RELIGIOUS: "religious",
  KIDS: "kids",
  MOVIES: "movies",
  DOCUMENTARY: "documentary",
  LIFESTYLE: "lifestyle",
  GAMING: "gaming",
  EDUCATION: "education",
  LOCAL: "local",
  INTERNATIONAL: "international",
};

/**
 * Station status
 */
export const STATION_STATUS = {
  READY: "ready",
  LIVE: "live",
  OFFLINE: "offline",
  MAINTENANCE: "maintenance",
  PENDING: "pending",
};

/**
 * Network affiliations
 */
export const STATION_NETWORKS = {
  SPS: "Southern Power Syndicate",
  PSN: "PowerStream Network",
  INDEPENDENT: "Independent",
};

const StationSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC INFO
    // ============================================================
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true, 
      index: true 
    },
    name: { type: String, required: true, index: true },
    slug: { 
      type: String, 
      unique: true, 
      sparse: true, 
      index: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "", maxlength: 1000 },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    
    // ============================================================
    // CATEGORIZATION
    // ============================================================
    category: { 
      type: String, 
      enum: Object.values(STATION_CATEGORIES),
      index: true 
    },
    tags: [{ type: String, index: true }],
    layout: { type: String, default: "powerfeed:auto" },

    // ============================================================
    // STREAMING CONFIGURATION
    // ============================================================
    streamKey: { type: String }, // Local stream key
    
    // Livepeer integration
    ingest: {
      rtmpUrl: { type: String },
      streamKey: { type: String },    // Livepeer streamKey
      playbackId: { type: String },
    },
    
    // Playback URLs
    playbackUrl: { type: String },         // Primary HLS URL
    liveStreamUrl: { type: String },       // Live stream URL
    backupStreamUrl: { type: String },     // Backup stream
    
    // Recording
    recordedPlaylistId: { type: String },  // Reference to VOD playlist
    enableDVR: { type: Boolean, default: false },

    // ============================================================
    // STATUS & METRICS
    // ============================================================
    status: { 
      type: String, 
      enum: Object.values(STATION_STATUS),
      default: STATION_STATUS.READY,
      index: true,
    },
    isLive: { type: Boolean, default: false, index: true },
    isPublic: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    
    // Live metrics (updated in real-time)
    viewerCount: { type: Number, default: 0, min: 0 },
    peakViewers: { type: Number, default: 0, min: 0 },
    totalViews: { type: Number, default: 0, min: 0 },
    
    // Engagement
    followersCount: { type: Number, default: 0, min: 0 },
    likesCount: { type: Number, default: 0, min: 0 },

    // ============================================================
    // CONTENT
    // ============================================================
    playlist: [{ 
      type: mongoose.Schema.Types.Mixed 
    }],
    currentShow: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Show" },
      title: String,
      startedAt: Date,
      endsAt: Date,
    },
    upNext: [{
      showId: { type: mongoose.Schema.Types.ObjectId, ref: "Show" },
      title: String,
      startsAt: Date,
    }],

    // ============================================================
    // NETWORK & REGION
    // ============================================================
    network: { 
      type: String, 
      enum: Object.values(STATION_NETWORKS),
      default: STATION_NETWORKS.INDEPENDENT,
      index: true 
    },
    region: { type: String, index: true }, // e.g., "US", "Global", "International"
    country: { type: String, index: true },
    timezone: { type: String, default: "America/Chicago" },
    language: { type: String, default: "en" },

    // ============================================================
    // MONETIZATION
    // ============================================================
    isMonetized: { type: Boolean, default: false },
    subscriptionRequired: { type: Boolean, default: false },
    subscriptionPrice: { type: Number, default: 0 },
    coinTipsEnabled: { type: Boolean, default: true },
    
    // Revenue sharing
    revenueShare: {
      owner: { type: Number, default: 70 }, // Percentage
      platform: { type: Number, default: 30 },
    },

    // ============================================================
    // SETTINGS
    // ============================================================
    settings: {
      chatEnabled: { type: Boolean, default: true },
      chatModeration: { type: String, enum: ["none", "basic", "strict"], default: "basic" },
      allowClips: { type: Boolean, default: true },
      allowReactions: { type: Boolean, default: true },
      maxQuality: { type: String, default: "1080p" },
    },

    // ============================================================
    // SCHEDULE
    // ============================================================
    schedule: [{
      dayOfWeek: { type: Number, min: 0, max: 6 },
      startTime: String, // "HH:mm"
      endTime: String,
      showId: { type: mongoose.Schema.Types.ObjectId, ref: "Show" },
      title: String,
      isLive: Boolean,
    }],
  },
  { 
    timestamps: true,
    collection: "stations",
  }
);

// ============================================================
// INDEXES
// ============================================================
StationSchema.index({ owner: 1 });
StationSchema.index({ isLive: 1, isPublic: 1 });
StationSchema.index({ category: 1, isPublic: 1 });
StationSchema.index({ network: 1, isPublic: 1 });
StationSchema.index({ region: 1, isPublic: 1 });
StationSchema.index({ viewerCount: -1 });
StationSchema.index({ followersCount: -1 });
StationSchema.index({ tags: 1 });

// ============================================================
// PRE-SAVE HOOKS
// ============================================================

// Generate slug from name if not provided
StationSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// ============================================================
// METHODS
// ============================================================

// Go live
StationSchema.methods.goLive = async function (streamUrl) {
  this.isLive = true;
  this.status = STATION_STATUS.LIVE;
  if (streamUrl) this.liveStreamUrl = streamUrl;
  await this.save();
  return this;
};

// Go offline
StationSchema.methods.goOffline = async function () {
  // Update peak viewers if current is higher
  if (this.viewerCount > this.peakViewers) {
    this.peakViewers = this.viewerCount;
  }
  this.isLive = false;
  this.status = STATION_STATUS.OFFLINE;
  this.viewerCount = 0;
  await this.save();
  return this;
};

// Update viewer count
StationSchema.methods.updateViewers = async function (count) {
  this.viewerCount = count;
  this.totalViews += 1;
  if (count > this.peakViewers) {
    this.peakViewers = count;
  }
  await this.save();
  return this;
};

// Get station summary
StationSchema.methods.getSummary = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    slug: this.slug,
    logoUrl: this.logoUrl,
    category: this.category,
    isLive: this.isLive,
    viewerCount: this.viewerCount,
    network: this.network,
  };
};

// ============================================================
// STATICS
// ============================================================

// Get live stations
StationSchema.statics.getLiveStations = async function (options = {}) {
  const { limit = 20, category, network } = options;
  
  const query = { isLive: true, isPublic: true };
  if (category) query.category = category;
  if (network) query.network = network;
  
  return this.find(query)
    .sort({ viewerCount: -1 })
    .limit(limit)
    .populate("owner", "name username avatarUrl");
};

// Get featured stations
StationSchema.statics.getFeatured = async function (limit = 10) {
  return this.find({ isFeatured: true, isPublic: true })
    .sort({ viewerCount: -1 })
    .limit(limit)
    .populate("owner", "name username avatarUrl");
};

// Find by slug
StationSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Get stations by category
StationSchema.statics.getByCategory = async function (category, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({ category, isPublic: true })
    .sort({ viewerCount: -1, followersCount: -1 })
    .skip(skip)
    .limit(limit)
    .populate("owner", "name username avatarUrl");
};

const Station = mongoose.models.Station || mongoose.model("Station", StationSchema);

export default Station;
export { StationSchema };

