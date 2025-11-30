// backend/recordingStudio/models/StudioProfile.js
import mongoose from "mongoose";

const StudioProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }, // ref to main User _id
  defaultBpm: Number,
  mixerPreset: String,
  lastProjectId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

export default mongoose.model("StudioProfile", StudioProfileSchema);
