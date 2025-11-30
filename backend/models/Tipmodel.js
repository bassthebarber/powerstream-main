import mongoose from "mongoose";
const { Schema, model } = mongoose;

/**
 * TIP = gratuity/micro‑payment between users, optionally tied to content.
 */
const TIPSchema = new Schema({
  fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  toUser:   { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amount:   { type: Number, required: true, min: 0 },
  currency: { type: String, default: "USD" },
  note:     { type: String },
  // Optional association to content
  post:     { type: Schema.Types.ObjectId, ref: "Post" },
  stream:   { type: Schema.Types.ObjectId, ref: "Stream" },
  station:  { type: Schema.Types.ObjectId, ref: "Station" },
  meta:     Schema.Types.Mixed,
  status:   { type: String, enum: ["pending", "succeeded", "failed", "refunded"], default: "succeeded" }
}, { timestamps: true });

TIPSchema.index({ toUser: 1, createdAt: -1 });
export default model("TIP", TIPSchema);
