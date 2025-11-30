import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  video1: {
    type: String, // Could be a Cloudinary or S3 URL
    required: true,
  },
  type: {
    type: String,
    default: 'video/mp4',
  },
  uploader: {
    type: String,
    required: true,
  },
  station: {
    type: String, // e.g. 'Southern Power'
    required: true,
  },
  timestamp: {
    type: Number,
    default: () => Math.floor(Date.now() / 1000), // Unix timestamp
  },
}, { timestamps: true });

export default mongoose.model('Video', videoSchema);
