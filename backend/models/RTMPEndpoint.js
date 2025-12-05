// backend/models/RTMPEndpoint.js
// Model for storing RTMP streaming platform configurations
import mongoose from "mongoose";

const RTMPEndpointSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: [
        "facebook",
        "youtube",
        "twitch",
        "kick",
        "linkedin",
        "instagram", // Uses bridge-proxy mode
        "tiktok", // Uses bridge-proxy mode
        "custom",
      ],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rtmpUrl: {
      type: String,
      required: true,
      trim: true,
    },
    streamKey: {
      type: String,
      required: true,
      trim: true,
    },
    // For Instagram/TikTok bridge-proxy mode
    bridgeProxyUrl: {
      type: String,
      default: null,
    },
    // Status tracking
    isActive: {
      type: Boolean,
      default: true,
    },
    lastStatus: {
      type: String,
      enum: ["connected", "disconnected", "error", "unknown"],
      default: "unknown",
    },
    lastError: {
      type: String,
      default: null,
    },
    lastConnectedAt: {
      type: Date,
      default: null,
    },
    // Station integration
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      index: true,
    },
    profileName: {
      type: String,
      trim: true,
      index: true,
    },
    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for quick lookups
RTMPEndpointSchema.index({ userId: 1, isActive: 1 });
RTMPEndpointSchema.index({ platform: 1 });

// Helper method to build full RTMP URL
RTMPEndpointSchema.methods.getFullRTMPUrl = function () {
  if (this.platform === "instagram" || this.platform === "tiktok") {
    // Use bridge-proxy URL if available
    return this.bridgeProxyUrl || this.rtmpUrl;
  }
  // Standard RTMP: rtmp://server/app/streamKey
  if (this.rtmpUrl.endsWith("/")) {
    return `${this.rtmpUrl}${this.streamKey}`;
  }
  return `${this.rtmpUrl}/${this.streamKey}`;
};

// Helper to check if platform needs bridge-proxy
RTMPEndpointSchema.methods.needsBridgeProxy = function () {
  return this.platform === "instagram" || this.platform === "tiktok";
};

export default mongoose.model("RTMPEndpoint", RTMPEndpointSchema);

