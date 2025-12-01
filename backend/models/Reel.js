// backend/models/Reel.js
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const ReelSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, default: "guest" },
    videoUrl: { type: String, required: true },
    hlsUrl: { type: String }, // HLS manifest if available
    caption: { type: String, trim: true, default: "" },
    soundReference: { type: String }, // reference to audio/sound used
    tags: { type: [String], default: [] },
    likes: { type: [String], default: [] }, // userIds who liked
    comments: { type: [CommentSchema], default: [] },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ReelSchema.index({ createdAt: -1 });
ReelSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Reel || mongoose.model("Reel", ReelSchema);


