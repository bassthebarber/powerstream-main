// backend/models/NLFRoyalty.js
// No Limit Forever TV - Royalty/Payout Ledger Model

import mongoose from "mongoose";

const nlfRoyaltySchema = new mongoose.Schema(
  {
    // References
    videoId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "NLFVideo", 
      required: true 
    },
    stationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "NLFTV", 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, // Viewer who triggered the view
    creatorUserId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, // Content creator/owner
    // Financial
    amount: { type: Number, required: true }, // Total amount generated
    platformCut: { type: Number, required: true }, // Platform's share
    creatorCut: { type: Number, required: true }, // Creator's share
    currency: { type: String, default: "USD" },
    // Transaction Details
    type: { 
      type: String, 
      enum: ["view", "premium_purchase", "tip", "subscription", "ad_revenue", "payout"],
      default: "view"
    },
    status: { 
      type: String, 
      enum: ["pending", "processed", "paid", "failed", "cancelled"],
      default: "pending"
    },
    // View Details
    watchDuration: { type: Number, default: 0 }, // seconds
    qualifiedView: { type: Boolean, default: false }, // > 30 seconds
    // Payout Details (for type: "payout")
    payoutMethod: { type: String },
    payoutReference: { type: String }, // Transaction ID from payment provider
    payoutDate: { type: Date },
    // Metadata
    ipAddress: { type: String },
    userAgent: { type: String },
    country: { type: String },
    deviceType: { type: String },
    // Timestamp
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
nlfRoyaltySchema.index({ videoId: 1 });
nlfRoyaltySchema.index({ stationId: 1 });
nlfRoyaltySchema.index({ userId: 1 });
nlfRoyaltySchema.index({ creatorUserId: 1 });
nlfRoyaltySchema.index({ type: 1 });
nlfRoyaltySchema.index({ status: 1 });
nlfRoyaltySchema.index({ timestamp: -1 });
nlfRoyaltySchema.index({ createdAt: -1 });

// Static method to get earnings summary
nlfRoyaltySchema.statics.getEarningsSummary = async function(stationId, startDate, endDate) {
  const match = { stationId, type: { $ne: "payout" } };
  if (startDate) match.timestamp = { $gte: startDate };
  if (endDate) match.timestamp = { ...match.timestamp, $lte: endDate };
  
  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalPlatformCut: { $sum: "$platformCut" },
        totalCreatorCut: { $sum: "$creatorCut" },
        totalViews: { $sum: { $cond: [{ $eq: ["$type", "view"] }, 1, 0] } },
        qualifiedViews: { $sum: { $cond: ["$qualifiedView", 1, 0] } },
        totalWatchTime: { $sum: "$watchDuration" },
      }
    }
  ]);
  
  return result[0] || {
    totalAmount: 0,
    totalPlatformCut: 0,
    totalCreatorCut: 0,
    totalViews: 0,
    qualifiedViews: 0,
    totalWatchTime: 0,
  };
};

// Static method to get video earnings
nlfRoyaltySchema.statics.getVideoEarnings = async function(videoId) {
  const result = await this.aggregate([
    { $match: { videoId, type: { $ne: "payout" } } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalViews: { $sum: 1 },
        qualifiedViews: { $sum: { $cond: ["$qualifiedView", 1, 0] } },
        totalWatchTime: { $sum: "$watchDuration" },
      }
    }
  ]);
  
  return result[0] || { totalAmount: 0, totalViews: 0, qualifiedViews: 0, totalWatchTime: 0 };
};

const NLFRoyalty = mongoose.model("NLFRoyalty", nlfRoyaltySchema);
export default NLFRoyalty;


