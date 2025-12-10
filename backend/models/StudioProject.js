// backend/models/StudioProject.js
// Studio Project model for organizing recordings, beats, and masters

import mongoose from "mongoose";

const studioProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bpm: { type: Number, default: 120 },
    key: { type: String, default: "C" },
    genre: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { 
      type: String, 
      enum: ["draft", "in-progress", "mixing", "mastering", "complete"],
      default: "draft" 
    },
    coverArtUrl: { type: String },
    tags: [{ type: String }],
    collaborators: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["producer", "artist", "writer", "engineer"], default: "artist" },
      addedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

studioProjectSchema.index({ ownerUserId: 1, createdAt: -1 });
studioProjectSchema.index({ status: 1 });

const StudioProject = mongoose.model("StudioProject", studioProjectSchema);

export default StudioProject;


