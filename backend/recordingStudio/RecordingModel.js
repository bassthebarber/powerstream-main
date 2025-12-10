// /studio/RecordingModel.js
import mongoose from "mongoose";

const RecordingSchema = new mongoose.Schema(
  {
    ownerEmail: { type: String, index: true },
    filename: String,
    mimeType: String,
    size: Number,
    storage: { type: String, enum: ["cloudinary", "local"], default: "cloudinary" },
    url: String,            // public URL (cloudinary or signed)
    secureUrl: String,      // https if from cloudinary
    publicId: String,       // cloudinary id
    meta: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Recording", RecordingSchema);
