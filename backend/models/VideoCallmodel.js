import mongoose from "mongoose";
const { Schema, model } = mongoose;

const VideoCallSchema = new Schema({
  room:        { type: Schema.Types.ObjectId, ref: "ChatRoom", index: true },
  host:        { type: Schema.Types.ObjectId, ref: "User", required: true },
  participants:[{ type: Schema.Types.ObjectId, ref: "User" }],
  startedAt:   Date,
  endedAt:     Date,
  status:      { type: String, enum: ["scheduled", "ringing", "live", "ended", "missed"], default: "scheduled" },
  recordingId: { type: String }, // external recorder id
  meta:        Schema.Types.Mixed
}, { timestamps: true });

VideoCallSchema.index({ room: 1, createdAt: -1 });
export default model("VideoCall", VideoCallSchema);
