import mongoose from "mongoose";
const { Schema, model } = mongoose;

const MediaFileSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", index: true },
  kind: { type: String, enum: ["image", "audio", "video", "file"], required: true },
  url: { type: String, required: true },
  publicId: String, // e.g., Cloudinary
  sizeBytes: Number,
  durationSec: Number,
  mimeType: String,
  meta: Schema.Types.Mixed
}, { timestamps: true });

export default model("MediaFile", MediaFileSchema);
