// backend/models/MultistreamSession.js
// Model for tracking multistream sessions
import mongoose from "mongoose";

const MultistreamSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      index: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MultistreamProfile",
      index: true,
    },
    inputUrl: {
      type: String,
      required: true,
    },
    endpoints: [
      {
        endpointId: String,
        platform: String,
        name: String,
        status: {
          type: String,
          enum: ["connecting", "connected", "disconnected", "error"],
        },
        error: String,
      },
    ],
    status: {
      type: String,
      enum: ["starting", "active", "stopping", "stopped", "error"],
      default: "starting",
    },
    startedAt: {
      type: Date,
      required: true,
    },
    stoppedAt: {
      type: Date,
    },
    duration: {
      type: Number, // seconds
    },
    exitCode: {
      type: Number,
    },
    signal: {
      type: String,
    },
    error: {
      type: String,
    },
    // Recording
    recordingPath: {
      type: String,
    },
    recordingReady: {
      type: Boolean,
      default: false,
    },
    recordingSize: {
      type: Number, // bytes
    },
    vodAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VODAsset",
    },
    // Metadata
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    logs: [
      {
        timestamp: Date,
        level: {
          type: String,
          enum: ["info", "warn", "error"],
        },
        message: String,
      },
    ],
  },
  { timestamps: true }
);

// Indexes
MultistreamSessionSchema.index({ userId: 1, startedAt: -1 });
MultistreamSessionSchema.index({ stationId: 1, startedAt: -1 });
MultistreamSessionSchema.index({ status: 1 });

// Calculate duration before save
MultistreamSessionSchema.pre("save", function (next) {
  if (this.stoppedAt && this.startedAt) {
    this.duration = Math.floor((this.stoppedAt - this.startedAt) / 1000);
  }
  next();
});

export default mongoose.model("MultistreamSession", MultistreamSessionSchema);





