// backend/recordingStudio/models/StudioSession.js
// Studio Session/Project Model
import mongoose from "mongoose";

const StudioSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["beat", "mix", "recording", "vocal", "full", "master"],
      default: "beat",
    },
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Metadata
    status: {
      type: String,
      enum: ["draft", "final", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

StudioSessionSchema.index({ userId: 1, updatedAt: -1 });
StudioSessionSchema.index({ userId: 1, type: 1 });

export default mongoose.model("StudioSession", StudioSessionSchema);





