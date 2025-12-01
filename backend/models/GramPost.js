// backend/models/GramPost.js
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const GramPostSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, default: "guest" },
    imageUrl: { type: String, required: true },
    caption: { type: String, trim: true, default: "" },
    tags: { type: [String], default: [] },
    likes: { type: [String], default: [] }, // userIds who liked
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true }
);

GramPostSchema.index({ createdAt: -1 });
GramPostSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.GramPost || mongoose.model("GramPost", GramPostSchema);


