import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ChatMessageSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["text", "image", "audio", "video", "file", "system"], default: "text" },
  text: String,
  media: { type: Schema.Types.ObjectId, ref: "MediaFile" },
  meta: Schema.Types.Mixed,
  deliveredTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
  readBy: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

ChatMessageSchema.index({ room: 1, createdAt: -1 });
export default model("ChatMessage", ChatMessageSchema);
