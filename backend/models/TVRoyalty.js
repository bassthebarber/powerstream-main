// backend/models/TVRoyalty.js
// Universal TV Royalty/Payout Ledger - Flexible split system

import mongoose from "mongoose";

// Payout modes supported across all stations
const PAYOUT_MODES = [
  "PLATFORM_ONLY",        // 100% to SPS (default)
  "STATION_OWNER_SPLIT",  // Split between platform and station owner
  "ARTIST_WITH_MANAGER",  // Split includes artist and manager (e.g., No Limit Gangsta)
];

const tvRoyaltySchema = new mongoose.Schema(
  {
    // === REFERENCES ===
    stationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      refPath: "stationType",
    },
    stationType: {
      type: String,
      enum: ["Station", "NLFTV", "ChurchStation", "SchoolStation"],
      default: "Station",
    },
    videoId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      refPath: "videoType",
    },
    videoType: {
      type: String,
      enum: ["Video", "NLFVideo", "Film"],
      default: "Video",
    },
    // Viewer who triggered the view (optional for anonymous)
    viewerUserId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: false,
    },

    // === PAYOUT CONFIGURATION ===
    payoutMode: { 
      type: String, 
      enum: PAYOUT_MODES,
      required: true,
      default: "PLATFORM_ONLY",
    },

    // === RECIPIENT IDs ===
    // SPS master wallet (Marcus)
    platformAccountId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: false, // Will be set from config
    },
    // Station owner (for STATION_OWNER_SPLIT mode)
    stationOwnerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: false,
    },
    // Artist who created the content (for ARTIST_WITH_MANAGER mode)
    artistUserId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: false,
    },
    // Manager (e.g., No Limit Gangsta for NLEH artists)
    managerUserId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: false,
    },

    // === MONEY AMOUNTS ===
    perViewAmount: { 
      type: Number, 
      required: true,
      default: 0.25, // $0.25 per view
    },
    // Individual cuts (actual dollar amounts)
    platformCut: { 
      type: Number, 
      required: true,
      default: 0,
    },
    stationOwnerCut: { 
      type: Number, 
      default: 0,
    },
    artistCut: { 
      type: Number, 
      default: 0,
    },
    managerCut: { 
      type: Number, 
      default: 0,
    },

    // === PERCENTAGES (for reference) ===
    platformCutPercentage: { type: Number, default: 100 },
    stationOwnerCutPercentage: { type: Number, default: 0 },
    artistCutPercentage: { type: Number, default: 0 },
    managerCutPercentage: { type: Number, default: 0 },

    // === STATUS ===
    status: { 
      type: String, 
      enum: ["pending", "processed", "paid", "failed", "cancelled"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["view", "premium", "tip", "subscription", "ad_revenue"],
      default: "view",
    },

    // === METADATA ===
    watchDuration: { type: Number, default: 0 }, // seconds
    qualifiedView: { type: Boolean, default: false }, // >30s
    ipAddress: { type: String },
    userAgent: { type: String },
    country: { type: String },
    deviceType: { type: String },

    // === PAYOUT TRACKING ===
    paidOut: { type: Boolean, default: false },
    payoutDate: { type: Date },
    payoutReference: { type: String }, // Transaction ID from payment provider
    payoutMethod: { type: String }, // "stripe", "paypal", "zelle", etc.
  },
  { timestamps: true }
);

// Indexes
tvRoyaltySchema.index({ stationId: 1 });
tvRoyaltySchema.index({ videoId: 1 });
tvRoyaltySchema.index({ viewerUserId: 1 });
tvRoyaltySchema.index({ artistUserId: 1 });
tvRoyaltySchema.index({ managerUserId: 1 });
tvRoyaltySchema.index({ platformAccountId: 1 });
tvRoyaltySchema.index({ stationOwnerId: 1 });
tvRoyaltySchema.index({ payoutMode: 1 });
tvRoyaltySchema.index({ status: 1 });
tvRoyaltySchema.index({ paidOut: 1 });
tvRoyaltySchema.index({ createdAt: -1 });

// === STATIC METHODS ===

// Get earnings summary for a station
tvRoyaltySchema.statics.getStationEarnings = async function(stationId, startDate, endDate) {
  const match = { stationId: new mongoose.Types.ObjectId(stationId) };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  
  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalViews: { $sum: 1 },
        totalRevenue: { $sum: "$perViewAmount" },
        totalPlatformCut: { $sum: "$platformCut" },
        totalStationOwnerCut: { $sum: "$stationOwnerCut" },
        totalArtistCut: { $sum: "$artistCut" },
        totalManagerCut: { $sum: "$managerCut" },
        qualifiedViews: { $sum: { $cond: ["$qualifiedView", 1, 0] } },
      }
    }
  ]);
  
  return result[0] || {
    totalViews: 0,
    totalRevenue: 0,
    totalPlatformCut: 0,
    totalStationOwnerCut: 0,
    totalArtistCut: 0,
    totalManagerCut: 0,
    qualifiedViews: 0,
  };
};

// Get earnings for a specific user (artist or manager)
tvRoyaltySchema.statics.getUserEarnings = async function(userId, role = "artist") {
  const matchField = role === "manager" ? "managerUserId" : "artistUserId";
  
  const result = await this.aggregate([
    { $match: { [matchField]: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: role === "manager" ? "$managerCut" : "$artistCut" },
        totalViews: { $sum: 1 },
        pendingPayout: {
          $sum: {
            $cond: [{ $eq: ["$paidOut", false] }, role === "manager" ? "$managerCut" : "$artistCut", 0]
          }
        },
        paidOutTotal: {
          $sum: {
            $cond: [{ $eq: ["$paidOut", true] }, role === "manager" ? "$managerCut" : "$artistCut", 0]
          }
        },
      }
    }
  ]);
  
  return result[0] || { totalEarnings: 0, totalViews: 0, pendingPayout: 0, paidOutTotal: 0 };
};

// Get video earnings
tvRoyaltySchema.statics.getVideoEarnings = async function(videoId) {
  const result = await this.aggregate([
    { $match: { videoId: new mongoose.Types.ObjectId(videoId) } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: 1 },
        totalRevenue: { $sum: "$perViewAmount" },
        artistEarnings: { $sum: "$artistCut" },
        qualifiedViews: { $sum: { $cond: ["$qualifiedView", 1, 0] } },
      }
    }
  ]);
  
  return result[0] || { totalViews: 0, totalRevenue: 0, artistEarnings: 0, qualifiedViews: 0 };
};

const TVRoyalty = mongoose.model("TVRoyalty", tvRoyaltySchema);
export default TVRoyalty;


