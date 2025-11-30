import mongoose from "mongoose";
const { Schema, model } = mongoose;

const StreamSchema = new Schema({
  station:   { type: Schema.Types.ObjectId, ref: "Station", index: true },
  title:     { type: String },
  streamKey: { type: String, index: true },
  isLive:    { type: Boolean, default: false },
  startedAt: Date,
  endedAt:   Date,
  ingestUrl: String,
  playbackUrl:String,
  meta:      Schema.Types.Mixed
}, { timestamps: true });

StreamSchema.index({ isLive: 1, startedAt: -1 });
export default model("Stream", StreamSchema);
