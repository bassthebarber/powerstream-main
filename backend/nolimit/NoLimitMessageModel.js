import mongoose from 'mongoose';

const noLimitMessageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('NoLimitMessage', noLimitMessageSchema);
