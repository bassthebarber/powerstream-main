import mongoose from "mongoose";
const { Schema, model } = mongoose;

const StreamStatusSchema = new Schema({
  station: { type: Schema.Types.ObjectId, ref: "Station", index: true },
  status: { type: String, enum: ["idle", "starting", "live", "ended", "error"], default: "idle" },
  startedAt: Date,
  endedAt: Date,
  bitrateKbps: Number,
  viewers: { type: Number, default: 0 },
  meta: Schema.Types.Mixed
}, { timestamps: true });

export default model("StreamStatus", StreamStatusSchema);
