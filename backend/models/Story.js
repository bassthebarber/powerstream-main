import mongoose from "mongoose";

const StorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video", "other"], default: "image" },
    caption: { type: String, default: "" },
  },
  { timestamps: true }
);

StorySchema.index({ createdAt: 1 });

export default mongoose.model("Story", StorySchema);





