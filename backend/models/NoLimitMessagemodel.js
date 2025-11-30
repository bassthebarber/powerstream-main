import mongoose from "mongoose";
const { Schema, model } = mongoose;

const NoLimitMessageSchema = new Schema({
  channel: { type: String, index: true }, // e.g., "global", "vip"
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  priority: { type: Number, default: 0 },
  expiresAt: Date
}, { timestamps: true });

export default model("NoLimitMessage", NoLimitMessageSchema);
