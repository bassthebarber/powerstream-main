// backend/recordingStudio/models/Producer.js
// Producer Model - For managing producers in the Studio
// Used for tracking beats, sessions, and exports by producer

import mongoose from 'mongoose';

const ProducerSchema = new mongoose.Schema({
  // === IDENTITY ===
  name: { 
    type: String, 
    required: true,
    trim: true,
  },
  
  handle: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    index: true,
    lowercase: true, // Store lowercase for case-insensitive matching
  },
  
  email: { 
    type: String, 
    trim: true,
    lowercase: true,
  },
  
  // === STATUS ===
  status: { 
    type: String, 
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
  
  // === PROFILE ===
  bio: { 
    type: String,
    maxlength: 1000,
  },
  
  links: {
    soundcloud: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    website: { type: String },
    spotify: { type: String },
  },
  
  // === OWNERSHIP ===
  // Link to User account if producer has a user account
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    sparse: true, // Not all producers need user accounts
  },
  
  // === METADATA ===
  notes: { type: String }, // Admin notes
  
}, { timestamps: true });

// === INDEXES ===
ProducerSchema.index({ handle: 1 }, { unique: true });
ProducerSchema.index({ status: 1 });
ProducerSchema.index({ name: 'text', handle: 'text', bio: 'text' });

// === METHODS ===

// Safe JSON for API responses
ProducerSchema.methods.toSafeJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    handle: this.handle,
    email: this.email,
    status: this.status,
    bio: this.bio,
    links: this.links,
    userId: this.userId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// === STATICS ===

// Find active producers
ProducerSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ name: 1 });
};

// Find by handle (case-insensitive)
ProducerSchema.statics.findByHandle = function(handle) {
  return this.findOne({ handle: handle.toLowerCase() });
};

export default mongoose.model('Producer', ProducerSchema);






