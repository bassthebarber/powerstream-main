// backend/models/BroadcastEvent.js
// Broadcast Empire Pack - Scheduled broadcast events for TV stations
import mongoose from 'mongoose';

const BroadcastEventSchema = new mongoose.Schema(
  {
    // Station reference
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
      index: true
    },

    // Event details
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },

    // Event type
    type: {
      type: String,
      enum: ['vod', 'premiere', 'live', 'replay'],
      default: 'vod'
    },

    // Media URLs
    videoUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },

    // Feature flags
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isLiveOverride: {
      type: Boolean,
      default: false,
      index: true
    },

    // Schedule
    startsAt: {
      type: Date,
      required: true,
      index: true
    },
    endsAt: {
      type: Date
    },

    // Status tracking
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
      index: true
    },

    // Creator info
    createdBy: {
      type: mongoose.Schema.Types.Mixed // String (email) or ObjectId
    },

    // Extra metadata (tags, categories, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
BroadcastEventSchema.index({ station: 1, startsAt: 1 });
BroadcastEventSchema.index({ station: 1, status: 1 });
BroadcastEventSchema.index({ station: 1, isFeatured: 1 });
BroadcastEventSchema.index({ station: 1, isLiveOverride: 1 });

// Virtual for checking if event is currently active
BroadcastEventSchema.virtual('isActive').get(function() {
  const now = new Date();
  if (this.status === 'live' || this.isLiveOverride) return true;
  if (this.startsAt <= now && (!this.endsAt || this.endsAt > now)) return true;
  return false;
});

// Ensure virtuals are included in JSON
BroadcastEventSchema.set('toJSON', { virtuals: true });
BroadcastEventSchema.set('toObject', { virtuals: true });

export default mongoose.models.BroadcastEvent || mongoose.model('BroadcastEvent', BroadcastEventSchema);


