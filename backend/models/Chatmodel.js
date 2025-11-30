import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ChatSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true, index: true },
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  lastMessageAt: { type: Date, index: true },
  isGroup: { type: Boolean, default: false },
  title: String
}, { timestamps: true });

export default model("Chat", ChatSchema);
