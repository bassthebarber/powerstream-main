// backend/models/MasterRender.js
// Master Render model for final mixed/mastered exports

import mongoose from "mongoose";

const masterRenderSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioProject" },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    audioUrl: { type: String, required: true },
    durationSeconds: { type: Number, default: 0 },
    quality: { 
      type: String, 
      enum: ["demo", "mixdown", "master", "stem"],
      default: "master" 
    },
    format: {
      type: String,
      enum: ["wav", "mp3", "flac", "aiff"],
      default: "wav"
    },
    sampleRate: { type: Number, default: 44100 },
    bitDepth: { type: Number, default: 16 },
    isClean: { type: Boolean, default: true },
    isExplicit: { type: Boolean, default: false },
    bpm: { type: Number },
    key: { type: String },
    genre: { type: String },
    coverArtUrl: { type: String },
    royaltyWorkId: { type: mongoose.Schema.Types.ObjectId, ref: "RoyaltyWork" },
    cloudinaryPublicId: { type: String },
    downloads: { type: Number, default: 0 },
    plays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

masterRenderSchema.index({ projectId: 1, createdAt: -1 });
masterRenderSchema.index({ ownerUserId: 1, createdAt: -1 });
masterRenderSchema.index({ quality: 1 });

const MasterRender = mongoose.model("MasterRender", masterRenderSchema);

export default MasterRender;


