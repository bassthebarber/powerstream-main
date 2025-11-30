// backend/models/SocialPost.js
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "anonymous" },
    text: { type: String, required: true, trim: true },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const SocialPostSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "anonymous", index: true },
    username: { type: String, default: "guest" },
    text: { type: String, trim: true, default: "" },
    mediaUrl: { type: String, trim: true, default: "" },
    mediaType: {
      type: String,
      enum: ["image", "video", "audio", "none"],
      default: "none",
    },
    likes: { type: [String], default: [] }, // store userIds
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true }
);

// speed recent feeds
SocialPostSchema.index({ createdAt: -1 });

const SocialPost =
  mongoose.models.SocialPost || mongoose.model("SocialPost", SocialPostSchema);

export default SocialPost;
