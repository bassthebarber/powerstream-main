import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AudioCallSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: "ChatRoom", index: true },
  caller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  callee: { type: Schema.Types.ObjectId, ref: "User", required: true },
  startedAt: Date,
  endedAt: Date,
  status: { type: String, enum: ["initiated", "ringing", "active", "ended", "missed"], default: "initiated" },
  meta: Schema.Types.Mixed
}, { timestamps: true });

export default model("AudioCall", AudioCallSchema);
