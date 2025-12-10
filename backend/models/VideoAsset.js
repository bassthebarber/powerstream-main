// backend/models/VideoAsset.js
// Golden TV Subsystem - VideoAsset Model
import mongoose from 'mongoose';

const VideoAssetSchema = new mongoose.Schema(
  {
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },     // Cloudinary/Livepeer URL
    thumbnailUrl: { type: String },
    station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
    category: {
      type: String,
      enum: ['music', 'film', 'clip', 'show', 'other'],
      default: 'clip'
    },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    duration: { type: Number }, // Duration in seconds
    tags: [{ type: String }]
  },
  { timestamps: true }
);

// Indexes for common queries
VideoAssetSchema.index({ station: 1, createdAt: -1 });
VideoAssetSchema.index({ station: 1, isFeatured: -1, createdAt: -1 });
VideoAssetSchema.index({ uploader: 1, createdAt: -1 });
VideoAssetSchema.index({ category: 1 });

export default mongoose.models.VideoAsset || mongoose.model('VideoAsset', VideoAssetSchema);


