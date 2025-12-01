// backend/recordingStudio/models/TVExport.js
// TV Streaming Export Model
// Tracks exports from Studio to PowerStream TV / Streaming platforms

import mongoose from 'mongoose';

const TVExportSchema = new mongoose.Schema({
  // === SOURCE REFERENCE ===
  // Reference to the Library item being exported
  libraryItemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LibraryItem',
    required: true,
    index: true,
  },
  
  // Can also reference a Mixdown or Beat directly
  mixdownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mixdown' },
  beatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beat' },
  
  // === ASSET INFO ===
  // Type of asset being exported
  assetType: { 
    type: String, 
    enum: ['song', 'instrumental', 'stem', 'show-intro', 'bumper', 'jingle', 'sound-effect', 'mix'],
    required: true,
    index: true,
  },
  
  // Asset metadata (copied from source for quick access)
  assetName: { type: String, required: true },
  assetUrl: { type: String, required: true }, // Direct URL to the audio file
  assetDuration: { type: Number }, // seconds
  assetBpm: { type: Number },
  assetKey: { type: String },
  assetGenre: { type: String },
  
  // Artist/Producer info
  artistName: { type: String },
  producerName: { type: String },
  producerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producer' },
  
  // === DESTINATION ===
  // Target station/channel
  targetStation: { 
    type: String, 
    required: true,
    index: true,
    enum: [
      'Southern Power Network',
      'No Limit East Houston',
      'Texas Got Talent',
      'Civic Connect',
      'Gospel Hour',
      'Late Night Vibes',
      'Morning Motivation',
      'Hip Hop Headquarters',
      'R&B Soul Station',
      'Custom',
    ],
  },
  
  // Optional: specific show or series
  targetShow: { type: String },
  
  // Optional: specific episode
  targetEpisode: { type: String },
  
  // Optional: playlist/rotation
  targetPlaylist: { type: String },
  
  // Scheduling
  scheduledAt: { type: Date }, // If scheduled for future broadcast
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  
  // === STATUS ===
  status: { 
    type: String, 
    enum: ['queued', 'processing', 'sent', 'confirmed', 'error', 'cancelled'],
    default: 'queued',
    index: true,
  },
  
  statusMessage: { type: String },
  
  // Retry tracking
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  lastRetryAt: { type: Date },
  
  // === EXTERNAL SYSTEM ===
  // ID on the TV system after successful send
  externalId: { type: String, index: true },
  externalUrl: { type: String }, // URL on TV system
  externalStatus: { type: String },
  
  // Response from TV API
  tvApiResponse: { type: mongoose.Schema.Types.Mixed },
  
  // === OWNERSHIP ===
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // === AUDIT ===
  sentAt: { type: Date },
  confirmedAt: { type: Date },
  errorAt: { type: Date },
  
}, { timestamps: true });

// === INDEXES ===
TVExportSchema.index({ status: 1, createdAt: -1 });
TVExportSchema.index({ targetStation: 1, status: 1 });
TVExportSchema.index({ ownerUserId: 1, createdAt: -1 });
TVExportSchema.index({ producerId: 1 });
TVExportSchema.index({ externalId: 1 }, { sparse: true });

// === METHODS ===

// Check if export can be retried
TVExportSchema.methods.canRetry = function() {
  return this.status === 'error' && this.retryCount < this.maxRetries;
};

// Mark as sent
TVExportSchema.methods.markSent = async function(externalId, response) {
  this.status = 'sent';
  this.sentAt = new Date();
  this.externalId = externalId;
  this.tvApiResponse = response;
  this.statusMessage = 'Successfully sent to TV system';
  await this.save();
};

// Mark as error
TVExportSchema.methods.markError = async function(errorMessage) {
  this.status = 'error';
  this.errorAt = new Date();
  this.statusMessage = errorMessage;
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  await this.save();
};

// Safe JSON for API response
TVExportSchema.methods.toSafeJSON = function() {
  return {
    _id: this._id,
    libraryItemId: this.libraryItemId,
    assetType: this.assetType,
    assetName: this.assetName,
    assetUrl: this.assetUrl,
    assetDuration: this.assetDuration,
    artistName: this.artistName,
    targetStation: this.targetStation,
    targetShow: this.targetShow,
    status: this.status,
    statusMessage: this.statusMessage,
    externalId: this.externalId,
    externalUrl: this.externalUrl,
    priority: this.priority,
    scheduledAt: this.scheduledAt,
    sentAt: this.sentAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// === STATICS ===

// Get queued exports ready to send
TVExportSchema.statics.getQueuedExports = function(limit = 10) {
  return this.find({ 
    status: 'queued',
  })
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit)
    .populate('libraryItemId');
};

// Get exports by station
TVExportSchema.statics.getByStation = function(station, options = {}) {
  const query = { targetStation: station };
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Get user's exports
TVExportSchema.statics.getByUser = function(userId, options = {}) {
  const query = { ownerUserId: userId };
  if (options.status) query.status = options.status;
  if (options.station) query.targetStation = options.station;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Get export stats
TVExportSchema.statics.getStats = async function() {
  const [total, queued, sent, errors] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ status: 'queued' }),
    this.countDocuments({ status: 'sent' }),
    this.countDocuments({ status: 'error' }),
  ]);
  
  return { total, queued, sent, errors };
};

export default mongoose.model('TVExport', TVExportSchema);

