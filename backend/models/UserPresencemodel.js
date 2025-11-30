import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserPresenceSchema = new Schema({
  user:      { type: Schema.Types.ObjectId, ref: "User", unique: true, index: true },
  status:    { type: String, enum: ["online", "offline", "away", "busy"], default: "offline" },
  lastSeenAt:{ type: Date },
  inRoom:    { type: Schema.Types.ObjectId, ref: "ChatRoom" },
  device:    { type: String }, // e.g., "web", "ios", "android", "desktop"
  ip:        { type: String }
}, { timestamps: true });

export default model("UserPresence", UserPresenceSchema);
