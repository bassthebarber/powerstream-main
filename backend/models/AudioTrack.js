import mongoose from 'mongoose';

const { Schema } = mongoose;

const audioTrackSchema = new Schema(
  {
    // Which station / channel this belongs to
    stationKey: {
      type: String,
      index: true,
      required: true, // e.g. "no-limit-east-houston"
    },

    // Core metadata
    title: { type: String, required: true },
    artistName: { type: String, required: true },
    albumName: { type: String },           // optional
    genre: { type: String },               // e.g. "Rap", "R&B", "Gospel"
    coverArtUrl: { type: String },         // Cloudinary image URL
    isExplicit: { type: Boolean, default: false },
    releaseDate: {
      type: Date,
      default: Date.now,
    },

    // Audio file
    audioUrl: {
      type: String,
      required: true,                      // Cloudinary (or HLS) stream URL
    },
    duration: {
      type: Number,                        // seconds
      default: 0,
    },

    // Ownership + monetization hooks
    ownerUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    playCount: {
      type: Number,
      default: 0,
    },
    totalPlaySeconds: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    }
  },
  {
    timestamps: true,
  }
);

const AudioTrack = mongoose.model('AudioTrack', audioTrackSchema);

export default AudioTrack;
