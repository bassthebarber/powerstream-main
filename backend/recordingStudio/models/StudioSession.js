// backend/recordingStudio/models/StudioSession.js
import mongoose from "mongoose";

const studioSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectName: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["beat", "recording", "mix", "master", "general"],
      default: "general"
    },
    data: { 
      type: Map, 
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: { 
      type: String, 
      enum: ["draft", "active", "completed", "archived"],
      default: "draft"
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

studioSessionSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default mongoose.model("StudioSession", studioSessionSchema);

