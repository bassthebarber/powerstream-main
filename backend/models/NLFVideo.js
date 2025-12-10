// backend/models/NLFVideo.js
// No Limit Forever TV - Video Model

import mongoose from "mongoose";

const ratingEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5, required: true },
  createdAt: { type: Date, default: Date.now },
});

const nlfVideoSchema = new mongoose.Schema(
  {
    // Station Reference
    stationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "NLFTV", 
      required: true 
    },
    // Basic Info
    title: { type: String, required: true },
    description: { type: String },
    // Media URLs
    videoUrl: { type: String, required: true },
    hlsUrl: { type: String },
    thumbnailUrl: { type: String },
    previewUrl: { type: String }, // Short preview/trailer
    // Metadata
    duration: { type: Number, default: 0 }, // seconds
    type: { 
      type: String, 
      enum: ["premiere", "concert", "documentary", "interview", "music_video", "behind_scenes", "special", "live_replay"],
      default: "premiere"
    },
    genre: { type: String },
    tags: [{ type: String }],
    artist: { type: String },
    releaseDate: { type: Date },
    // Flags
    isPremiere: { type: Boolean, default: false },
    isExclusive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    ageRestricted: { type: Boolean, default: false },
    // Engagement
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 }, // total seconds watched
    completionRate: { type: Number, default: 0 }, // percentage 0-100
    // Ratings
    ratings: [ratingEntrySchema],
    rating: { type: Number, default: 0, min: 0, max: 5 }, // average rating
    ratingCount: { type: Number, default: 0 },
    // Monetization
    revenuePerView: { type: Number, default: 0.001 }, // USD per view
    totalRevenue: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    premiumPrice: { type: Number, default: 0 },
    // Upload Info
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cloudinaryPublicId: { type: String },
    fileSize: { type: Number }, // bytes
    resolution: { type: String }, // e.g., "1080p", "4K"
  },
  { timestamps: true }
);

// Method to calculate average rating
nlfVideoSchema.methods.calculateRating = function() {
  if (this.ratings.length === 0) {
    this.rating = 0;
    this.ratingCount = 0;
    return;
  }
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  this.rating = Math.round((sum / this.ratings.length) * 10) / 10; // 1 decimal
  this.ratingCount = this.ratings.length;
};

// Method to add a view and calculate revenue
nlfVideoSchema.methods.addView = function(watchDuration = 0) {
  this.views += 1;
  this.watchTime += watchDuration;
  if (this.duration > 0) {
    this.completionRate = Math.min(100, (watchDuration / this.duration) * 100);
  }
  // Revenue only counts for significant views (watched > 30 seconds)
  if (watchDuration >= 30) {
    this.totalRevenue += this.revenuePerView;
  }
};

// Indexes
nlfVideoSchema.index({ stationId: 1 });
nlfVideoSchema.index({ type: 1 });
nlfVideoSchema.index({ views: -1 });
nlfVideoSchema.index({ rating: -1 });
nlfVideoSchema.index({ createdAt: -1 });
nlfVideoSchema.index({ isFeatured: 1 });
nlfVideoSchema.index({ tags: 1 });

const NLFVideo = mongoose.model("NLFVideo", nlfVideoSchema);
export default NLFVideo;


