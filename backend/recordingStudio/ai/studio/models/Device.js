import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ["mixer", "mic", "controller", "monitor", "custom"], default: "custom" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  accessToken: String,
  connected: { type: Boolean, default: false },
  lastSeen: Date
});

export default mongoose.model("Device", DeviceSchema);
