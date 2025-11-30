import mongoose from 'mongoose';

const reelVideoSchema = new mongoose.Schema({
  videoUrl: String,
  caption: String
}, { timestamps: true });

export default mongoose.model('ReelVideo', reelVideoSchema);
