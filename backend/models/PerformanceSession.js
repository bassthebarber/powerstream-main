// backend/models/PerformanceSession.js

import mongoose from "mongoose";

const performanceSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    artistName: { type: String, required: true },
    trackTitle: { type: String, required: true },
    coachMode: {
      type: String,
      enum: ["standard", "dre", "master_p", "kanye", "timbaland", "motivational", "scarface20"],
      default: "scarface20",
    },
    lyrics: { type: String },
    transcript: { type: String },
    audioUrl: { type: String }, // Cloudinary / S3 URL (optional for now)
    scores: {
      delivery: { type: Number, min: 0, max: 100 },
      clarity: { type: Number, min: 0, max: 100 },
      emotion: { type: Number, min: 0, max: 100 },
      energy: { type: Number, min: 0, max: 100 },
      pitch: { type: Number, min: 0, max: 100 },
      flow: { type: Number, min: 0, max: 100 },
      confidence: { type: Number, min: 0, max: 100 },
      overall: { type: Number, min: 0, max: 100 },
    },
    feedback: { type: String }, // main paragraph
    suggestions: [String],      // bullet list
    bestTake: { type: Boolean, default: false },
    rawAiResponse: { type: Object }, // raw JSON from AI
  },
  { timestamps: true }
);

export default mongoose.model("PerformanceSession", performanceSessionSchema);



