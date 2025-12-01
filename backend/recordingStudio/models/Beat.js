// backend/recordingStudio/models/Beat.js
// Model for storing beats (generated or uploaded)

import mongoose from 'mongoose';

const BeatSchema = new mongoose.Schema({
  // Basic info
  title: { 
    type: String, 
    required: true,
    default: 'Untitled Beat'
  },
  description: { type: String },
  
  // Musical attributes
  genre: { type: String },
  bpm: { type: Number },
  key: { type: String },
  mood: { type: String },
  tags: [{ type: String }],
  
  // Files
  fileUrl: { 
    type: String, 
    required: true 
  },
  previewUrl: { type: String }, // Short preview URL for Beat Store
  localPath: { type: String }, // Local file path
  stemUrls: {
    kick: { type: String },
    snare: { type: String },
    hihat: { type: String },
    bass: { type: String },
    melody: { type: String },
  },
  waveformData: [{ type: Number }], // Normalized waveform for visualization
  
  // Metadata
  durationSeconds: { type: Number },
  duration: { type: Number }, // Alias for durationSeconds
  fileSize: { type: Number },
  format: { type: String, default: 'mp3' },
  sampleRate: { type: Number, default: 44100 },
  bitrate: { type: Number },
  loudness: { type: Number }, // Integrated loudness (LUFS)
  
  // === PowerTune Analysis ===
  powerTune: {
    analyzed: { type: Boolean, default: false },
    analyzedAt: { type: Date },
    method: { type: String },
    camelot: { type: String }, // Camelot wheel notation
  },
  
  source: { 
    type: String, 
    enum: ['musicgen', 'openai', 'uploaded', 'fallback', 'pattern', 'manual', 'ai-generated'],
    default: 'uploaded',
    index: true,
  },
  
  // Pattern data (for fallback/demo mode)
  pattern: {
    kick: [{ type: Boolean }],
    snare: [{ type: Boolean }],
    hat: [{ type: Boolean }],
    perc: [{ type: Boolean }],
    '808': [{ type: Boolean }],
  },
  
  // Producer/Artist info
  producerName: { type: String, default: 'Studio AI' },
  artistName: { type: String },
  
  // Commerce
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  purchases: { type: Number, default: 0 },
  plays: { type: Number, default: 0 },
  licensed: { type: Boolean, default: false },
  licenseType: { type: String },
  
  // Royalty reference
  royaltySplitId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoyaltySplit' },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'ready', 'published', 'archived'],
    default: 'ready',
    index: true,
  },
  visibility: {
    type: String,
    enum: ['private', 'unlisted', 'public'],
    default: 'public',
  },
  
  // Ownership
  // producerId can reference either User or Producer model
  producerId: { type: mongoose.Schema.Types.ObjectId, refPath: 'producerModel' },
  producerModel: { type: String, enum: ['User', 'Producer'], default: 'User' },
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Library Item reference (for unified library)
  libraryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryItem' },
  
}, { timestamps: true });

// Indexes for efficient queries
BeatSchema.index({ genre: 1, bpm: 1 });
BeatSchema.index({ mood: 1 });
BeatSchema.index({ tags: 1 });
BeatSchema.index({ producerId: 1 });
BeatSchema.index({ createdAt: -1 });
BeatSchema.index({ status: 1, visibility: 1 });
BeatSchema.index({ title: 'text', tags: 'text', producerName: 'text' });

// Virtual for display URL
BeatSchema.virtual('displayUrl').get(function() {
  return this.previewUrl || this.fileUrl;
});

// Method to format for store display
BeatSchema.methods.toStoreFormat = function() {
  return {
    _id: this._id,
    title: this.title,
    producer: this.producerName || 'Studio AI',
    bpm: this.bpm,
    key: this.key,
    loudness: this.loudness,
    camelot: this.powerTune?.camelot,
    duration: this.durationSeconds || this.duration,
    mood: this.mood,
    genre: this.genre,
    tags: this.tags || [],
    previewUrl: this.previewUrl || this.fileUrl,
    fileUrl: this.fileUrl,
    price: this.price,
    plays: this.plays,
    source: this.source,
    pattern: this.pattern,
    powerTuneAnalyzed: this.powerTune?.analyzed || false,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('Beat', BeatSchema);
