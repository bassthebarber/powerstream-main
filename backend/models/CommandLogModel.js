// /backend/models/CommandLogModel.js
import mongoose from 'mongoose';

const commandLogSchema = new mongoose.Schema({
  command: String,
  system: String,
  action: String,
  triggeredBy: String,
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('CommandLog', commandLogSchema);
