// backend/models/Recording.js
// Studio Recording model - for audio recordings in PowerHarmony Studio

import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema(
  {
    // Basic info
    title: { type: String, default: "Untitled Recording" },
    description: { type: String, default: "" },
    filename: { type: String, required: true },
    fileUrl: { type: String },
    
    // Owner
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioSession" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioProject" },
    
    // Audio metadata
    duration: { type: Number, default: 0 }, // seconds
    format: { type: String, default: "webm" }, // webm, mp3, wav
    sampleRate: { type: Number, default: 48000 },
    bitrate: { type: Number },
    channels: { type: Number, default: 2 },
    fileSize: { type: Number, default: 0 }, // bytes
    
    // Recording type
    type: { 
      type: String, 
      enum: ["vocal", "instrument", "beat", "mix", "master", "scratch", "final"],
      default: "vocal" 
    },
    
    // Track info
    trackNumber: { type: Number, default: 1 },
    takeNumber: { type: Number, default: 1 },
    
    // Status
    status: { 
      type: String, 
      enum: ["recording", "processing", "ready", "error", "deleted"],
      default: "ready" 
    },
    
    // Engagement
    playCount: { type: Number, default: 0 },
    
    // Waveform visualization data (JSON)
    waveformData: { type: String },
    
    // Tags for organization
    tags: [{ type: String }],
    
    // Cloud storage reference
    cloudinaryPublicId: { type: String },
    cloudinaryUrl: { type: String },
    
    // Mastered version (after processing)
    masteredUrl: { type: String, default: null },
    masteredAt: { type: Date, default: null },
    masteringPreset: { type: String, default: null },
    
    // Artist metadata for publishing
    artistName: { type: String, default: null },
    
    // Notes
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes
recordingSchema.index({ userId: 1, createdAt: -1 });
recordingSchema.index({ sessionId: 1 });
recordingSchema.index({ projectId: 1 });
recordingSchema.index({ status: 1 });
recordingSchema.index({ type: 1 });

const Recording = mongoose.model("Recording", recordingSchema);

export default Recording;

