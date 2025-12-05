import mongoose from "mongoose";

const feedPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // Creator's user ID
    authorName: { type: String, default: "Guest" },
    content: { type: String, default: "" },
    image: { type: String, default: "" }, // legacy image URL support
    mediaUrl: { type: String, default: "" }, // image or video URL
    mediaType: { type: String, enum: ["image", "video", "other", ""], default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        authorName: { type: String },
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("FeedPost", feedPostSchema);
