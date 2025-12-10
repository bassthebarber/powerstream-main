// backend/models/Stream.js
// Golden TV Subsystem - Stream Model
import mongoose from 'mongoose';

const StreamSchema = new mongoose.Schema(
  {
    station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    streamKey: { type: String, required: true },
    isLive: { type: Boolean, default: false },
    liveUrl: { type: String }, // HLS playback URL
    startedAt: { type: Date },
    endedAt: { type: Date }
  },
  { timestamps: true }
);

// Index for finding live streams quickly
StreamSchema.index({ station: 1, isLive: 1 });
StreamSchema.index({ isLive: 1, startedAt: -1 });

export default mongoose.models.Stream || mongoose.model('Stream', StreamSchema);
