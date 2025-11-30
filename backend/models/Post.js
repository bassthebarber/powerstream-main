import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Types.ObjectId, required: true, index: true },
    channel: { type: String, enum: ["feed", "gram", "reel"], default: "feed", index: true },
    text: { type: String, default: "" },
    mediaUrl: String,         // optional image/video
    playbackUrl: String,      // optional HLS playback if you want to embed live/recorded
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
