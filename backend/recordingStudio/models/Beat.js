import mongoose from "mongoose";

const beatSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    producerName: String,
    bpm: Number,
    key: String,
    tags: [String],
    price: { type: Number, default: 0 },
    filePath: String, // where audio is stored
    previewUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("Beat", beatSchema);
