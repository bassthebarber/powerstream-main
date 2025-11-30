import mongoose from 'mongoose';

const streamSchema = new mongoose.Schema({
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  url: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }
}, { timestamps: true });

export default mongoose.model('Stream', streamSchema);
