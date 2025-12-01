// backend/recordingStudio/models/Recording.js
// Model for storing raw recordings/takes from Record Boot or Upload

import mongoose from 'mongoose';

const RecordingSchema = new mongoose.Schema({
  // Basic info
  title: { 
    type: String, 
    default: 'Untitled Recording'
  },
  artistName: { 
    type: String, 
    default: 'Unknown Artist'
  },
  email: { type: String },
  
  // File info
  audioUrl: { 
    type: String, 
    required: true 
  },
  localFilePath: { type: String },
  
  // Metadata
  durationSeconds: { type: Number },
  fileSize: { type: Number },
  format: { type: String, default: 'webm' },
  sampleRate: { type: Number, default: 44100 },
  channels: { type: Number, default: 1 },
  
  // Source
  source: { 
    type: String, 
    enum: ['recordboot', 'record', 'upload', 'import'],
    default: 'recordboot'
  },
  
  // AI Coach analysis (if analyzed)
  aiAnalysis: {
    coachId: { type: String },
    overallScore: { type: Number },
    delivery: { type: Number },
    flow: { type: Number },
    emotion: { type: Number },
    clarity: { type: Number },
    feedback: { type: String },
    suggestions: [{ type: String }],
    analyzedAt: { type: Date },
  },
  
  // Associated beat (if recording with beat)
  beatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beat' },
  beatUrl: { type: String },
  
  // Producer reference (optional - can be set directly or inferred from beat)
  producerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producer' },
  
  // Tags and categorization
  tags: [{ type: String }],
  genre: { type: String },
  mood: { type: String },
  
  // === PowerTune Analysis ===
  key: { type: String }, // Musical key e.g. "C minor", "G major"
  bpm: { type: Number }, // Beats per minute
  loudness: { type: Number }, // Integrated loudness (LUFS)
  powerTune: {
    analyzed: { type: Boolean, default: false },
    analyzedAt: { type: Date },
    method: { type: String },
    camelot: { type: String }, // Camelot wheel notation
  },
  
  // Ownership
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'ready', 'processing', 'failed'],
    default: 'ready'
  },
  
}, { timestamps: true });

// Indexes
RecordingSchema.index({ ownerUserId: 1, createdAt: -1 });
RecordingSchema.index({ source: 1 });
RecordingSchema.index({ 'aiAnalysis.coachId': 1 });

export default mongoose.model('Recording', RecordingSchema);

