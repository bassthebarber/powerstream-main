// backend/models/BeatFile.js
// Beat File model for instrumentals and beats

import mongoose from "mongoose";

const beatFileSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    audioUrl: { type: String, required: true },
    previewUrl: { type: String },
    bpm: { type: Number, default: 120 },
    key: { type: String, default: "C" },
    genre: { type: String, default: "" },
    mood: { type: String, default: "" },
    tags: [{ type: String }],
    durationSeconds: { type: Number, default: 0 },
    stems: [{
      name: { type: String },
      url: { type: String },
      type: { type: String, enum: ["drums", "bass", "melody", "chords", "fx", "other"] },
    }],
    isPublic: { type: Boolean, default: false },
    price: { type: Number, default: 0 }, // 0 = free
    downloads: { type: Number, default: 0 },
    plays: { type: Number, default: 0 },
    cloudinaryPublicId: { type: String },
  },
  { timestamps: true }
);

beatFileSchema.index({ ownerUserId: 1, createdAt: -1 });
beatFileSchema.index({ genre: 1 });
beatFileSchema.index({ isPublic: 1, createdAt: -1 });

const BeatFile = mongoose.model("BeatFile", beatFileSchema);

export default BeatFile;


