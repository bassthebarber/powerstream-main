// backend/recordingStudio/models/Mixdown.js
// Model for storing mastered/mixed audio tracks

import mongoose from 'mongoose';

const MixdownSchema = new mongoose.Schema({
  // Basic info
  title: { 
    type: String, 
    default: 'Untitled Mix'
  },
  trackTitle: { 
    type: String, 
    default: function() { return this.title || 'Untitled Mix'; }
  },
  artistName: { 
    type: String, 
    default: 'Unknown Artist'
  },
  genre: { 
    type: String,
    default: 'unknown'
  },
  
  // User reference
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

  // File paths/URLs
  inputFilePath: { type: String },
  inputUrl: { type: String },
  outputFilePath: { type: String },
  outputUrl: { type: String }, // Cloudinary or public URL
  cloudinaryId: { type: String }, // Cloudinary public_id for deletion
  
  // Mix/Master settings applied
  settings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // Loudness metrics from FFmpeg
  loudnessIntegrated: { type: Number }, // LUFS
  loudnessRange: { type: Number }, // LU
  truePeak: { type: Number }, // dBTP
  dynamicRange: { type: Number }, // dB

  // Processing settings used
  processingChain: {
    eq: {
      lowCut: { type: Number, default: 80 },
      presence: { type: Number, default: 50 },
      air: { type: Number, default: 30 },
    },
    compressor: {
      threshold: { type: Number, default: -12 },
      ratio: { type: Number, default: 4 },
      attack: { type: Number, default: 10 },
      release: { type: Number, default: 100 },
    },
    limiter: {
      ceiling: { type: Number, default: -0.3 },
    },
    loudnessTarget: { type: Number, default: -14 }, // LUFS target
  },

  // Metadata
  processingNotes: { type: String },
  processingTime: { type: Number }, // milliseconds
  fileSize: { type: Number }, // bytes
  duration: { type: Number }, // seconds
  sampleRate: { type: Number, default: 44100 },
  channels: { type: Number, default: 2 },
  format: { type: String, default: 'mp3' },
  bitrate: { type: Number, default: 320 },
  
  // === PowerTune Analysis ===
  key: { type: String }, // Musical key e.g. "C minor"
  bpm: { type: Number }, // Beats per minute
  loudness: { type: Number }, // Integrated loudness (LUFS) - alias for loudnessIntegrated
  powerTune: {
    analyzed: { type: Boolean, default: false },
    analyzedAt: { type: Date },
    method: { type: String },
    camelot: { type: String },
  },

  // Status
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'complete', 'failed'],
    default: 'pending'
  },
  errorMessage: { type: String },

  // Ownership
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

// Index for efficient queries
MixdownSchema.index({ ownerUserId: 1, createdAt: -1 });
MixdownSchema.index({ userId: 1, createdAt: -1 });
MixdownSchema.index({ status: 1 });

export default mongoose.model('Mixdown', MixdownSchema);

