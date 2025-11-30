import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SystemStatusSchema = new Schema({
  name: { type: String, required: true },        // e.g., "db", "stream", "queue"
  level: { type: String, enum: ["ok", "degraded", "down"], default: "ok" },
  detail: String,
  lastHeartbeatAt: Date
}, { timestamps: true });

SystemStatusSchema.index({ name: 1 }, { unique: true });
export default model("SystemStatus", SystemStatusSchema);
