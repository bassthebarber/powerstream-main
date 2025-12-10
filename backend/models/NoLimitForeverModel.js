// backend/models/NoLimitForeverModel.js
// No Limit Forever TV - Global Flagship Station Model

import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ["premiere", "concert", "documentary", "interview", "live", "rerun", "special"],
    default: "premiere"
  },
  thumbnailUrl: { type: String },
  videoUrl: { type: String },
  hlsUrl: { type: String },
  duration: { type: Number, default: 0 }, // seconds
  airDate: { type: Date },
  isLive: { type: Boolean, default: false },
  isPremiere: { type: Boolean, default: false },
  isExclusive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  artist: { type: String },
  tags: [{ type: String }],
}, { timestamps: true });

const scheduleItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  type: { 
    type: String, 
    enum: ["premiere", "concert", "documentary", "interview", "live", "rerun", "special"],
    default: "premiere"
  },
  broadcastId: { type: mongoose.Schema.Types.ObjectId, ref: "NLFBroadcast" },
  isLive: { type: Boolean, default: false },
  artist: { type: String },
  recurring: { type: Boolean, default: false },
  recurrencePattern: { type: String }, // "daily", "weekly", "monthly"
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  eventDate: { type: Date, required: true },
  venue: { type: String },
  type: { 
    type: String, 
    enum: ["concert", "premiere", "award_show", "special", "listening_party", "interview"],
    default: "special"
  },
  thumbnailUrl: { type: String },
  ticketUrl: { type: String },
  isVirtual: { type: Boolean, default: false },
  willStream: { type: Boolean, default: true },
  artists: [{ type: String }],
});

const noLimitForeverSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      default: "No Limit Forever TV" 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      default: "nlf-tv"
    },
    description: { 
      type: String, 
      default: "Global flagship station for exclusive premieres & broadcasts" 
    },
    tagline: {
      type: String,
      default: "The Official Global Broadcast Network of the No Limit Empire"
    },
    // Streaming
    streamKey: { type: String, required: true },
    rtmpUrl: { type: String },
    hlsUrl: { type: String },
    // Branding
    logoUrl: { 
      type: String, 
      default: "/logos/nolimit-forever-logo.png" 
    },
    bannerUrl: { type: String },
    primaryColor: { type: String, default: "#FFD700" }, // Gold
    secondaryColor: { type: String, default: "#000000" }, // Black
    // Status
    isLive: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    currentBroadcast: { type: mongoose.Schema.Types.ObjectId, ref: "NLFBroadcast" },
    // Stats
    totalViews: { type: Number, default: 0 },
    subscriberCount: { type: Number, default: 0 },
    currentViewers: { type: Number, default: 0 },
    // Content
    broadcasts: [broadcastSchema],
    schedule: [scheduleItemSchema],
    events: [eventSchema],
    // Social
    socialLinks: {
      instagram: { type: String },
      twitter: { type: String },
      youtube: { type: String },
      tiktok: { type: String },
      facebook: { type: String },
    },
    // Contact
    contactEmail: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

// Indexes
noLimitForeverSchema.index({ slug: 1 });
noLimitForeverSchema.index({ isLive: 1 });
noLimitForeverSchema.index({ "broadcasts.isLive": 1 });
noLimitForeverSchema.index({ "schedule.startTime": 1 });

const NoLimitForever = mongoose.model("NoLimitForever", noLimitForeverSchema);
export default NoLimitForever;


