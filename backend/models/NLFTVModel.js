// backend/models/NLFTVModel.js
// No Limit Forever TV - Station Model with Payout Settings

import mongoose from "mongoose";

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
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "NLFVideo" },
  isLive: { type: Boolean, default: false },
  recurring: { type: Boolean, default: false },
});

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5, required: true },
  createdAt: { type: Date, default: Date.now },
});

const payoutSettingsSchema = new mongoose.Schema({
  bankAccount: { type: String },
  bankName: { type: String },
  routingNumber: { type: String },
  accountHolderName: { type: String },
  paypalEmail: { type: String },
  preferredMethod: { 
    type: String, 
    enum: ["bank", "paypal", "crypto"], 
    default: "paypal" 
  },
  platformCutPercentage: { type: Number, default: 15, min: 0, max: 100 },
  creatorCutPercentage: { type: Number, default: 85, min: 0, max: 100 },
  minimumPayout: { type: Number, default: 50 }, // USD
  payoutFrequency: { 
    type: String, 
    enum: ["weekly", "biweekly", "monthly"], 
    default: "monthly" 
  },
  lastPayoutDate: { type: Date },
  pendingBalance: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  totalPaidOut: { type: Number, default: 0 },
});

const nlftvSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      default: "No Limit Forever TV"
    },
    slug: {
      type: String,
      unique: true,
      default: "nlf-tv"
    },
    description: { 
      type: String, 
      default: "The Official Global Broadcast Network of the No Limit Empire"
    },
    tagline: {
      type: String,
      default: "Where Legends Live Forever"
    },
    // Branding
    logoUrl: { 
      type: String, 
      default: "/logos/nolimit-forever-logo.png" 
    },
    bannerUrl: { type: String },
    primaryColor: { type: String, default: "#FFD700" },
    secondaryColor: { type: String, default: "#000000" },
    // Streaming
    streamKey: { type: String, required: true },
    streamUrl: { type: String },
    rtmpUrl: { type: String },
    hlsUrl: { type: String },
    // Status
    isLive: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    // Content References
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "NLFVideo" }],
    featuredVideoId: { type: mongoose.Schema.Types.ObjectId, ref: "NLFVideo" },
    schedule: [scheduleItemSchema],
    // Ratings
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    // Stats
    viewCount: { type: Number, default: 0 },
    subscriberCount: { type: Number, default: 0 },
    currentViewers: { type: Number, default: 0 },
    totalWatchTime: { type: Number, default: 0 }, // seconds
    // Ownership & Payouts
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    payoutSettings: { type: payoutSettingsSchema, default: () => ({}) },
    // Social
    socialLinks: {
      instagram: { type: String },
      twitter: { type: String },
      youtube: { type: String },
      tiktok: { type: String },
    },
  },
  { timestamps: true }
);

// Calculate average rating
nlftvSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    return;
  }
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  this.averageRating = sum / this.ratings.length;
  this.totalRatings = this.ratings.length;
};

// Indexes
nlftvSchema.index({ slug: 1 });
nlftvSchema.index({ isLive: 1 });
nlftvSchema.index({ "ownerUserId": 1 });

const NLFTV = mongoose.model("NLFTV", nlftvSchema);
export default NLFTV;


