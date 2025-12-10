import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema(
  {
    artistName: String,
    sessionName: String,
    filePath: String,
    durationSeconds: Number,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Recording", recordingSchema);
