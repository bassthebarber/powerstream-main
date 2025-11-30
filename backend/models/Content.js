import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    channel: { type: String, enum: ["feed", "gram", "reel"], required: true },
    text: String,
    imageUrl: String,        // for PowerGram / PowerFeed
    videoUrl: String,        // mp4 fallback (optional)
    playbackUrl: String,     // HLS .m3u8 for PowerReels (Livepeer)
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Content", ContentSchema);
