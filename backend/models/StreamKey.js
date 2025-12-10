// backend/models/StreamKey.js
// Southern Power Unified Stream Key Model

import mongoose from "mongoose";

const streamKeySchema = new mongoose.Schema(
  {
    // Label for this key
    label: { 
      type: String, 
      required: true,
      trim: true,
    },
    
    // The actual RTMP key string
    key: { 
      type: String, 
      required: true, 
      unique: true,
    },
    
    // Channel name
    channelName: { 
      type: String, 
      default: "Southern Power",
    },

    // Who is allowed to use this key
    allowedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Which station / TV channel this controls
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
    },

    // Multiplatform config for simultaneous streaming
    platforms: {
      facebook: {
        enabled: { type: Boolean, default: true },
        rtmpUrl: { type: String, default: "" },
        streamKey: { type: String, default: "" },
        lastUsed: { type: Date },
      },
      instagram: {
        enabled: { type: Boolean, default: true },
        rtmpUrl: { type: String, default: "" },
        streamKey: { type: String, default: "" },
        lastUsed: { type: Date },
      },
      youtube: {
        enabled: { type: Boolean, default: true },
        rtmpUrl: { type: String, default: "" },
        streamKey: { type: String, default: "" },
        lastUsed: { type: Date },
      },
      tiktok: {
        enabled: { type: Boolean, default: false },
        rtmpUrl: { type: String, default: "" },
        streamKey: { type: String, default: "" },
        lastUsed: { type: Date },
      },
      twitch: {
        enabled: { type: Boolean, default: false },
        rtmpUrl: { type: String, default: "" },
        streamKey: { type: String, default: "" },
        lastUsed: { type: Date },
      },
    },

    // Status
    isActive: { type: Boolean, default: true },
    
    // Stream tracking
    isLive: { type: Boolean, default: false },
    lastStreamStart: { type: Date },
    lastStreamEnd: { type: Date },
    totalStreamMinutes: { type: Number, default: 0 },
    
    // RTMP endpoint configuration
    rtmpEndpoint: { 
      type: String, 
      default: "rtmp://localhost:1935/southernpower",
    },
  },
  { timestamps: true }
);

// Indexes
streamKeySchema.index({ key: 1 }, { unique: true });
streamKeySchema.index({ label: 1 });
streamKeySchema.index({ channelName: 1 });
streamKeySchema.index({ isActive: 1 });
streamKeySchema.index({ allowedUsers: 1 });

// Static method to find by key
streamKeySchema.statics.findByKey = function(keyValue) {
  return this.findOne({ key: keyValue, isActive: true });
};

// Method to check if user is allowed
streamKeySchema.methods.isUserAllowed = function(userId) {
  if (!userId) return false;
  return this.allowedUsers.some(id => id.toString() === userId.toString());
};

// Method to start stream
streamKeySchema.methods.startStream = async function() {
  this.isLive = true;
  this.lastStreamStart = new Date();
  await this.save();
};

// Method to end stream
streamKeySchema.methods.endStream = async function() {
  if (this.isLive && this.lastStreamStart) {
    const durationMinutes = (Date.now() - this.lastStreamStart.getTime()) / 60000;
    this.totalStreamMinutes += durationMinutes;
  }
  this.isLive = false;
  this.lastStreamEnd = new Date();
  await this.save();
};

const StreamKey = mongoose.model("StreamKey", streamKeySchema);

export default StreamKey;

