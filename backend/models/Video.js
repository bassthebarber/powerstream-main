// backend/models/Video.js
// Video model for station video catalog

import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 0, // in seconds
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      index: true,
    },
    stationSlug: {
      type: String,
      index: true,
    },
    category: {
      type: String,
      default: "general",
    },
    tags: [{
      type: String,
    }],
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    cloudinaryPublicId: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
videoSchema.index({ stationId: 1, createdAt: -1 });
videoSchema.index({ stationSlug: 1, createdAt: -1 });
videoSchema.index({ category: 1 });

const Video = mongoose.model("Video", videoSchema);

export default Video;


