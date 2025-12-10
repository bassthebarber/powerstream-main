// backend/models/TVRating.js
// Universal TV Rating Model - Works across all stations

import mongoose from "mongoose";

const tvRatingSchema = new mongoose.Schema(
  {
    // Who rated
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: false, // Optional for anonymous ratings
    },
    // What station
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
    // What video
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
    // The rating
    stars: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5,
    },
    // Optional review comment
    comment: { 
      type: String,
      maxlength: 500,
    },
    // Metadata
    ipAddress: { type: String },
    userAgent: { type: String },
    deviceType: { 
      type: String, 
      enum: ["desktop", "mobile", "tablet", "tv", "unknown"],
      default: "unknown",
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate ratings
tvRatingSchema.index({ userId: 1, videoId: 1 }, { unique: true, sparse: true });
tvRatingSchema.index({ stationId: 1 });
tvRatingSchema.index({ videoId: 1 });
tvRatingSchema.index({ stars: 1 });
tvRatingSchema.index({ createdAt: -1 });

// Static method to calculate average rating for a video
tvRatingSchema.statics.calculateVideoRating = async function(videoId) {
  const result = await this.aggregate([
    { $match: { videoId: new mongoose.Types.ObjectId(videoId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$stars" },
        totalCount: { $sum: 1 },
        distribution: {
          $push: "$stars"
        }
      }
    }
  ]);
  
  if (result.length === 0) {
    return { rating: 0, ratingCount: 0, distribution: {} };
  }
  
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result[0].distribution.forEach(s => { dist[s]++; });
  
  return {
    rating: Math.round(result[0].averageRating * 10) / 10,
    ratingCount: result[0].totalCount,
    distribution: dist,
  };
};

// Static method to get station average rating
tvRatingSchema.statics.calculateStationRating = async function(stationId) {
  const result = await this.aggregate([
    { $match: { stationId: new mongoose.Types.ObjectId(stationId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$stars" },
        totalCount: { $sum: 1 },
      }
    }
  ]);
  
  if (result.length === 0) {
    return { rating: 0, ratingCount: 0 };
  }
  
  return {
    rating: Math.round(result[0].averageRating * 10) / 10,
    ratingCount: result[0].totalCount,
  };
};

const TVRating = mongoose.model("TVRating", tvRatingSchema);
export default TVRating;


