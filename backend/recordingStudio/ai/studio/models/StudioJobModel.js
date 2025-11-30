// backend/ai/studio/models/StudioJobModel.js
import mongoose from "mongoose";

const StudioJobSchema = new mongoose.Schema(
  {
    jobId: String,
    type: String,
    track: String,
    status: { type: String, default: "queued" },
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StudioJob = mongoose.model("StudioJob", StudioJobSchema);
export default StudioJob;
