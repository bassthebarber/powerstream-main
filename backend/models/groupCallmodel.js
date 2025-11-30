import mongoose from "mongoose";
const { Schema, model } = mongoose;

const GroupCallSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: "ChatRoom", index: true },
  host: { type: Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  startedAt: Date,
  endedAt: Date,
  status: { type: String, enum: ["scheduled", "live", "ended"], default: "scheduled" }
}, { timestamps: true });

export default model("GroupCall", GroupCallSchema);
