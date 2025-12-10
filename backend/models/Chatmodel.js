// backend/models/ChatModel.js
// Chat/Conversation model for PowerLine messaging
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    title: { type: String, default: "" },
    isGroup: { type: Boolean, default: false },
    lastMessageAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Index for finding chats by participant
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;

