// backend/recordingStudio/models/LibraryItem.js
// Unified Library Item Model - Supports beats, vocals, mixes, exports
// Central storage for all studio-generated content

import mongoose from 'mongoose';

const LibraryItemSchema = new mongoose.Schema({
  // === CORE IDENTITY ===
  title: { 
    type: String, 
    required: true,
    default: 'Untitled'
  },
  
  // Item type for filtering and routing
  type: { 
    type: String, 
    enum: ['beat', 'vocal', 'mix', 'export', 'recording', 'stem', 'sample'],
    required: true,
    index: true,
  },
  
  // === MUSICAL PROPERTIES ===
  bpm: { type: Number, index: true },
  key: { type: String }, // e.g., "C minor", "G major"
  duration: { type: Number }, // seconds
  mood: { type: String, index: true }, // dark, uplifting, aggressive, etc.
  genre: { type: String, index: true }, // trap, drill, rnb, etc.
  tags: [{ type: String }], // searchable tags
  
  // === FILE REFERENCES ===
  fileUrl: { type: String }, // Primary file URL (Cloudinary or local)
  previewUrl: { type: String }, // Short preview for Beat Store
  localPath: { type: String }, // Local file path if stored locally
  stemUrls: { // For beats with separated stems
    kick: { type: String },
    snare: { type: String },
    hihat: { type: String },
    bass: { type: String },
    melody: { type: String },
    vocal: { type: String },
  },
  waveformData: [{ type: Number }], // Normalized waveform for visualization
  
  // === METADATA ===
  artistName: { type: String, default: 'Unknown Artist' },
  producerName: { type: String, default: 'Studio AI' },
  description: { type: String },
  fileSize: { type: Number }, // bytes
  format: { type: String, default: 'mp3' }, // mp3, wav, flac
  sampleRate: { type: Number, default: 44100 },
  channels: { type: Number, default: 2 },
  bitrate: { type: Number }, // kbps
  
  // === SOURCE TRACKING ===
  source: { 
    type: String, 
    enum: ['ai-generated', 'uploaded', 'recorded', 'mastered', 'mixed', 'imported'],
    default: 'uploaded',
    index: true,
  },
  sourceId: { type: String }, // Reference to original (e.g., beatId, recordingId)
  parentItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryItem' }, // For derivatives
  
  // === BEAT-SPECIFIC (for type: 'beat') ===
  pattern: { // Step sequencer pattern data
    kick: [{ type: Boolean }],
    snare: [{ type: Boolean }],
    hat: [{ type: Boolean }],
    perc: [{ type: Boolean }],
    '808': [{ type: Boolean }],
  },
  
  // === MIX-SPECIFIC (for type: 'mix' or 'export') ===
  loudnessIntegrated: { type: Number }, // LUFS
  loudnessRange: { type: Number }, // LU
  truePeak: { type: Number }, // dBTP
  loudness: { type: Number }, // Alias for loudnessIntegrated (PowerTune)
  processingNotes: { type: String },
  
  // === PowerTune Analysis ===
  powerTune: {
    analyzed: { type: Boolean, default: false },
    analyzedAt: { type: Date },
    method: { type: String },
    camelot: { type: String },
  },
  processingChain: { // Applied effects chain
    eq: {
      lowCut: { type: Number },
      highBoost: { type: Number },
    },
    compression: {
      ratio: { type: Number },
      threshold: { type: Number },
    },
    stereoWidth: { type: Number },
    loudnessTarget: { type: Number },
  },
  
  // === COMMERCE ===
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  licensed: { type: Boolean, default: false },
  licenseType: { type: String }, // basic, premium, exclusive
  purchases: { type: Number, default: 0 },
  plays: { type: Number, default: 0 },
  
  // === ROYALTY TRACKING ===
  royaltySplitId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoyaltySplit' },
  
  // === OWNERSHIP ===
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collaborators: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    role: { type: String },
    percentage: { type: Number },
  }],
  
  // === STATUS ===
  status: { 
    type: String, 
    enum: ['draft', 'ready', 'processing', 'published', 'archived'],
    default: 'ready',
    index: true,
  },
  visibility: {
    type: String,
    enum: ['private', 'unlisted', 'public'],
    default: 'private',
  },
  
  // === RELATIONSHIPS ===
  // For vocals/recordings associated with a beat
  associatedBeatId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryItem' },
  // For mixes/exports that combine multiple items
  sourceItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LibraryItem' }],
  
}, { timestamps: true });

// === INDEXES ===
LibraryItemSchema.index({ type: 1, createdAt: -1 });
LibraryItemSchema.index({ type: 1, genre: 1 });
LibraryItemSchema.index({ type: 1, mood: 1 });
LibraryItemSchema.index({ bpm: 1 });
LibraryItemSchema.index({ tags: 1 });
LibraryItemSchema.index({ ownerUserId: 1, type: 1, createdAt: -1 });
LibraryItemSchema.index({ status: 1, visibility: 1 });
LibraryItemSchema.index({ title: 'text', tags: 'text', artistName: 'text' });

// === VIRTUAL PROPERTIES ===
LibraryItemSchema.virtual('displayUrl').get(function() {
  return this.previewUrl || this.fileUrl;
});

// === METHODS ===
LibraryItemSchema.methods.toStoreFormat = function() {
  return {
    _id: this._id,
    title: this.title,
    type: this.type,
    producer: this.producerName,
    artistName: this.artistName,
    bpm: this.bpm,
    key: this.key,
    duration: this.duration,
    mood: this.mood,
    genre: this.genre,
    tags: this.tags,
    previewUrl: this.previewUrl || this.fileUrl,
    fileUrl: this.fileUrl,
    price: this.price,
    plays: this.plays,
    source: this.source,
    status: this.status,
    createdAt: this.createdAt,
  };
};

// === STATICS ===
LibraryItemSchema.statics.findBeats = function(filters = {}) {
  const query = { type: 'beat', status: { $in: ['ready', 'published'] } };
  
  if (filters.genre) query.genre = filters.genre;
  if (filters.mood) query.mood = filters.mood;
  if (filters.bpmMin || filters.bpmMax) {
    query.bpm = {};
    if (filters.bpmMin) query.bpm.$gte = Number(filters.bpmMin);
    if (filters.bpmMax) query.bpm.$lte = Number(filters.bpmMax);
  }
  
  const sortOptions = {
    newest: { createdAt: -1 },
    popular: { plays: -1, createdAt: -1 },
    price_low: { price: 1 },
    price_high: { price: -1 },
  };
  
  return this.find(query)
    .sort(sortOptions[filters.sort] || sortOptions.newest)
    .limit(filters.limit || 50)
    .skip(filters.skip || 0);
};

LibraryItemSchema.statics.findVocals = function(filters = {}) {
  const query = { type: { $in: ['vocal', 'recording'] }, status: 'ready' };
  if (filters.genre) query.genre = filters.genre;
  return this.find(query).sort({ createdAt: -1 }).limit(filters.limit || 50);
};

LibraryItemSchema.statics.findMixes = function(filters = {}) {
  const query = { type: { $in: ['mix', 'export'] }, status: 'ready' };
  return this.find(query).sort({ createdAt: -1 }).limit(filters.limit || 50);
};

export default mongoose.model('LibraryItem', LibraryItemSchema);

