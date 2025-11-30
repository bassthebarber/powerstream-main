import mongoose from "mongoose";
const { Schema, model } = mongoose;

/**
 * WebRTC signaling payloads (SDP/ICE) exchanged via server.
 */
const VideoSignalSchema = new Schema({
  call:        { type: Schema.Types.ObjectId, ref: "VideoCall", index: true },
  fromUser:    { type: Schema.Types.ObjectId, ref: "User", index: true },
  toUser:      { type: Schema.Types.ObjectId, ref: "User" },
  kind:        { type: String, enum: ["offer", "answer", "ice"], required: true },
  payload:     Schema.Types.Mixed, // SDP or ICE candidate blob
  deliveredAt: Date
}, { timestamps: true });

VideoSignalSchema.index({ call: 1, createdAt: 1 });
export default model("VideoSignal", VideoSignalSchema);
