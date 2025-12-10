// backend/recordingStudio/models/Mixdown.js
import mongoose from "mongoose";

const mixdownSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    trackTitle: String,
    artistName: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    settings: mongoose.Schema.Types.Mixed,
    inputUrl: String,
    outputUrl: String,
    cloudinaryId: String,
    genre: String,
    duration: Number,
    loudnessIntegrated: Number, // LUFS
    truePeak: Number, // dB
    lra: Number, // Loudness Range
    status: { 
      type: String, 
      enum: ["pending", "processing", "complete", "error"],
      default: "pending"
    },
    errorMessage: String,
    processingTime: Number, // ms
    notes: String,
  },
  { timestamps: true }
);

mixdownSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Mixdown", mixdownSchema);

