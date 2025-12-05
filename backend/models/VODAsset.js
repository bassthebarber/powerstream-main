// backend/models/VODAsset.js
// Model for Video-On-Demand assets (recorded streams)
import mongoose from "mongoose";

const VODAssetSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    recordedAt: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number, // seconds
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    fileSize: {
      type: Number, // bytes
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes
VODAssetSchema.index({ stationId: 1, recordedAt: -1 });
VODAssetSchema.index({ userId: 1, recordedAt: -1 });
VODAssetSchema.index({ status: 1 });

export default mongoose.model("VODAsset", VODAssetSchema);



