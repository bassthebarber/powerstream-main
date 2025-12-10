// backend/models/TVShow.js
// Golden TV Subsystem - TVShow Model (for TV Guide scheduling)
import mongoose from 'mongoose';

const TVShowSchema = new mongoose.Schema(
  {
    station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    title: { type: String, required: true },
    description: { type: String },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoAsset' },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isRecurring: { type: Boolean, default: false },
    recurringPattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', null],
      default: null
    }
  },
  { timestamps: true }
);

// Indexes for TV Guide queries
TVShowSchema.index({ station: 1, startsAt: 1 });
TVShowSchema.index({ endsAt: 1 });
TVShowSchema.index({ station: 1, endsAt: 1 });

export default mongoose.models.TVShow || mongoose.model('TVShow', TVShowSchema);


