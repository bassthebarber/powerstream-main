import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AutoResponseSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  scope: { type: String, enum: ["global", "room", "user"], default: "global" },
  room: { type: Schema.Types.ObjectId, ref: "ChatRoom" },
  owner: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default model("AutoResponse", AutoResponseSchema);
