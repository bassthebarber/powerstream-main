import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ChatPresenceSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", unique: true, index: true },
  status: { type: String, enum: ["online", "offline", "away", "busy"], default: "offline" },
  lastSeenAt: Date,
  inRoom: { type: Schema.Types.ObjectId, ref: "ChatRoom" },
  device: String
}, { timestamps: true });

export default model("ChatPresence", ChatPresenceSchema);
