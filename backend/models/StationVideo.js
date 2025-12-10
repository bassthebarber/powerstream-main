import mongoose from "mongoose";

const StationVideoSchema = new mongoose.Schema(
  {
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    duration: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isLive: { type: Boolean, default: false },
    isPremiere: { type: Boolean, default: false },
    premiereAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("StationVideo", StationVideoSchema);
