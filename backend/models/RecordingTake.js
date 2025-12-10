// backend/models/RecordingTake.js
// Recording Take model for individual vocal/instrument recordings

import mongoose from "mongoose";

const recordingTakeSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioProject" },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, default: "Untitled Take" },
    audioUrl: { type: String, required: true },
    durationSeconds: { type: Number, default: 0 },
    takeNumber: { type: Number, default: 1 },
    type: { 
      type: String, 
      enum: ["vocal", "instrument", "scratch", "final"],
      default: "vocal" 
    },
    notes: { type: String, default: "" },
    isSelected: { type: Boolean, default: false },
    waveformData: { type: String }, // JSON stringified waveform
    cloudinaryPublicId: { type: String },
  },
  { timestamps: true }
);

recordingTakeSchema.index({ projectId: 1, createdAt: -1 });
recordingTakeSchema.index({ ownerUserId: 1, createdAt: -1 });

const RecordingTake = mongoose.model("RecordingTake", recordingTakeSchema);

export default RecordingTake;


