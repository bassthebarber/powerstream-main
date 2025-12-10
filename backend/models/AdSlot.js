// backend/models/AdSlot.js
// Ad slot model for monetization per Overlord Spec
import mongoose from "mongoose";

const adSlotSchema = new mongoose.Schema(
  {
    // Location identifier (e.g., 'feed-inline', 'tv-banner', 'video-preroll')
    location: {
      type: String,
      required: true,
      enum: [
        "feed-inline",
        "feed-sidebar",
        "tv-banner",
        "tv-overlay",
        "video-preroll",
        "video-midroll",
        "audio-preroll",
        "station-header",
        "app-banner",
      ],
    },
    
    // Ad content
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    
    description: {
      type: String,
      maxlength: 500,
    },
    
    // Media
    imageUrl: String,
    videoUrl: String,
    
    // Link
    targetUrl: {
      type: String,
      required: true,
    },
    
    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    
    pricingModel: {
      type: String,
      enum: ["cpm", "cpc", "flat-rate", "per-day"],
      default: "cpm",
    },
    
    // Scheduling
    startDate: {
      type: Date,
      default: Date.now,
    },
    
    endDate: {
      type: Date,
    },
    
    // Status
    active: {
      type: Boolean,
      default: true,
    },
    
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "paused", "ended"],
      default: "pending",
    },
    
    // Targeting
    targeting: {
      stations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Station" }],
      regions: [String],
      demographics: {
        minAge: Number,
        maxAge: Number,
        genders: [String],
      },
      interests: [String],
    },
    
    // Advertiser
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Metrics
    impressions: {
      type: Number,
      default: 0,
    },
    
    clicks: {
      type: Number,
      default: 0,
    },
    
    budget: {
      type: Number,
      default: 0,
    },
    
    spent: {
      type: Number,
      default: 0,
    },
    
    // Admin fields
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    approvedAt: Date,
    
    rejectionReason: String,
  },
  { 
    timestamps: true,
    collection: "adslots",
  }
);

// Indexes
adSlotSchema.index({ location: 1, active: 1 });
adSlotSchema.index({ advertiser: 1 });
adSlotSchema.index({ status: 1 });
adSlotSchema.index({ startDate: 1, endDate: 1 });

// Get active ads for a location
adSlotSchema.statics.getActiveForLocation = async function(location, options = {}) {
  const { limit = 5 } = options;
  const now = new Date();
  
  return this.find({
    location,
    active: true,
    status: "active",
    startDate: { $lte: now },
    $or: [
      { endDate: { $gte: now } },
      { endDate: null },
    ],
  })
    .sort({ price: -1 }) // Higher paying ads first
    .limit(limit)
    .populate("advertiser", "name");
};

// Record impression
adSlotSchema.methods.recordImpression = async function() {
  this.impressions += 1;
  if (this.pricingModel === "cpm") {
    this.spent += this.price / 1000;
  }
  await this.save();
};

// Record click
adSlotSchema.methods.recordClick = async function() {
  this.clicks += 1;
  if (this.pricingModel === "cpc") {
    this.spent += this.price;
  }
  await this.save();
};

const AdSlot = mongoose.models.AdSlot || mongoose.model("AdSlot", adSlotSchema);

export default AdSlot;


