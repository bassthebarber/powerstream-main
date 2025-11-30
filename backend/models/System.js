import mongoose from 'mongoose';

const systemSchema = new mongoose.Schema({
  uptime: { type: String },
  memoryUsage: { type: Object },
  cpuLoad: { type: Object },
  logs: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('System', systemSchema);
