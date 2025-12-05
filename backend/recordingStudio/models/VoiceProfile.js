// backend/recordingStudio/models/VoiceProfile.js
// AI Voice Clone Profile Model
// Stores artist voice profiles for AI voice synthesis
// IMPORTANT: Each profile is strictly tied to the artist who created it

import mongoose from 'mongoose';

const VoiceProfileSchema = new mongoose.Schema({
  // === IDENTITY & OWNERSHIP ===
  // Artist/User who owns this voice profile - CRITICAL for security
  artistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true, // One profile per artist
    index: true,
  },
  
  // Display name for the voice (artist's choice, e.g., "My Studio Voice")
  displayName: { 
    type: String, 
    required: true,
    maxlength: 100,
    validate: {
      validator: function(v) {
        // Block celebrity/artist names to prevent impersonation
        const blockedPatterns = [
          /drake/i, /beyonce/i, /rihanna/i, /kanye/i, /travis\s*scott/i,
          /taylor\s*swift/i, /kendrick/i, /future/i, /lil\s*wayne/i,
          /nicki\s*minaj/i, /cardi\s*b/i, /megan\s*thee/i, /doja\s*cat/i,
          /post\s*malone/i, /juice\s*wrld/i, /xxxtentacion/i, /pop\s*smoke/i,
          /eminem/i, /jay[\s-]*z/i, /nas\b/i, /tupac/i, /biggie/i,
          /snoop/i, /dr\s*dre/i, /50\s*cent/i, /ice\s*cube/i,
        ];
        return !blockedPatterns.some(pattern => pattern.test(v));
      },
      message: 'Display name cannot impersonate known artists. Please use your own artist name.'
    }
  },
  
  // Email for verification (should match artist's account)
  email: { type: String },
  
  // === PROVIDER DETAILS ===
  // Voice clone provider (e.g., 'elevenlabs', 'resemble', 'playht', 'custom')
  provider: { 
    type: String, 
    default: 'elevenlabs',
    enum: ['elevenlabs', 'resemble', 'playht', 'coqui', 'custom', 'stub'],
  },
  
  // Provider's model/voice ID after training
  providerModelId: { type: String },
  
  // Provider-specific metadata
  providerMetadata: {
    voiceId: { type: String },
    modelVersion: { type: String },
    language: { type: String, default: 'en' },
    accent: { type: String },
    gender: { type: String, enum: ['male', 'female', 'neutral'] },
    ageGroup: { type: String, enum: ['youth', 'adult', 'mature'] },
  },
  
  // === TRAINING DATA ===
  // References to training audio files
  trainingSamples: [{
    libraryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryItem' },
    recordingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recording' },
    fileUrl: { type: String },
    duration: { type: Number }, // seconds
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'processed', 'rejected'], default: 'pending' },
  }],
  
  // Total training audio duration (recommended: 3-10 minutes)
  totalTrainingDuration: { type: Number, default: 0 },
  
  // Minimum samples required
  minSamplesRequired: { type: Number, default: 3 },
  maxSamplesAllowed: { type: Number, default: 10 },
  
  // === STATUS ===
  status: { 
    type: String, 
    enum: ['pending', 'training', 'ready', 'failed', 'disabled'],
    default: 'pending',
    index: true,
  },
  
  statusMessage: { type: String },
  
  // Training progress (0-100)
  trainingProgress: { type: Number, default: 0 },
  
  // Training timestamps
  trainingStartedAt: { type: Date },
  trainingCompletedAt: { type: Date },
  
  // === CONSENT & VERIFICATION ===
  // Artist must explicitly consent to voice cloning
  consentGiven: { type: Boolean, required: true, default: false },
  consentTimestamp: { type: Date },
  consentIpAddress: { type: String },
  
  // Terms version accepted
  termsVersion: { type: String, default: '1.0' },
  
  // Verification status
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  verificationMethod: { type: String, enum: ['email', 'phone', 'manual'] },
  
  // === USAGE LIMITS ===
  // Prevent abuse
  dailySynthesisLimit: { type: Number, default: 50 },
  monthlySynthesisLimit: { type: Number, default: 500 },
  synthesisCount: { type: Number, default: 0 },
  lastSynthesisReset: { type: Date, default: Date.now },
  
  // === QUALITY SETTINGS ===
  voiceSettings: {
    stability: { type: Number, default: 0.5, min: 0, max: 1 },
    clarity: { type: Number, default: 0.75, min: 0, max: 1 },
    style: { type: Number, default: 0, min: 0, max: 1 },
    speakerBoost: { type: Boolean, default: true },
  },
  
  // === AUDIT TRAIL ===
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

// === INDEXES ===
VoiceProfileSchema.index({ artistId: 1 }, { unique: true });
VoiceProfileSchema.index({ status: 1 });
VoiceProfileSchema.index({ provider: 1, providerModelId: 1 });

// === METHODS ===

// Check if profile is ready for synthesis
VoiceProfileSchema.methods.isReady = function() {
  return this.status === 'ready' && this.providerModelId && this.consentGiven;
};

// Check daily limit
VoiceProfileSchema.methods.canSynthesize = function() {
  const today = new Date();
  const lastReset = new Date(this.lastSynthesisReset);
  
  // Reset counter if new day
  if (today.toDateString() !== lastReset.toDateString()) {
    this.synthesisCount = 0;
    this.lastSynthesisReset = today;
  }
  
  return this.synthesisCount < this.dailySynthesisLimit;
};

// Increment synthesis count
VoiceProfileSchema.methods.incrementSynthesis = async function() {
  this.synthesisCount += 1;
  await this.save();
};

// Safe profile data for API response (excludes sensitive fields)
VoiceProfileSchema.methods.toSafeJSON = function() {
  return {
    _id: this._id,
    artistId: this.artistId,
    displayName: this.displayName,
    status: this.status,
    statusMessage: this.statusMessage,
    trainingProgress: this.trainingProgress,
    totalTrainingDuration: this.totalTrainingDuration,
    trainingSamplesCount: this.trainingSamples?.length || 0,
    consentGiven: this.consentGiven,
    verified: this.verified,
    voiceSettings: this.voiceSettings,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isReady: this.isReady(),
    canSynthesize: this.canSynthesize(),
    remainingSyntheses: Math.max(0, this.dailySynthesisLimit - this.synthesisCount),
  };
};

// === STATICS ===

// Find profile by artist ID with security check
VoiceProfileSchema.statics.findByArtistId = async function(artistId, requestingUserId) {
  // Security: Only return profile if requesting user is the artist
  if (artistId.toString() !== requestingUserId?.toString()) {
    return null;
  }
  return this.findOne({ artistId });
};

// Get ready profiles count (admin stat)
VoiceProfileSchema.statics.getReadyCount = function() {
  return this.countDocuments({ status: 'ready' });
};

export default mongoose.model('VoiceProfile', VoiceProfileSchema);




