// backend/models/ChatMessageModel.js
// Chat message model for PowerLine messaging
import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    media: [{ type: String }], // URLs or media IDs
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes for efficient querying
chatMessageSchema.index({ chat: 1, createdAt: -1 });
chatMessageSchema.index({ author: 1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;

