// backend/models/StudioLabel.js
// Studio Label & Engineer/Producer Permission System
// No Limit East Houston Edition

import mongoose from "mongoose";

const StudioLabelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  // Owners have full control
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  ownerNames: [{ type: String }], // For display
  
  // Authorized Engineers - can mix, master, apply effects
  engineers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    permissions: {
      canMix: { type: Boolean, default: true },
      canMaster: { type: Boolean, default: true },
      canApplyFX: { type: Boolean, default: true },
      canExport: { type: Boolean, default: true },
      canAccessAI: { type: Boolean, default: true },
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedAt: { type: Date, default: Date.now },
  }],
  
  // Authorized Producers - can create beats, arrangements
  producers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    permissions: {
      canCreateBeats: { type: Boolean, default: true },
      canUseAIGenerator: { type: Boolean, default: true },
      canSellBeats: { type: Boolean, default: false },
      canAccessLibrary: { type: Boolean, default: true },
      canCollaborate: { type: Boolean, default: true },
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedAt: { type: Date, default: Date.now },
  }],
  
  // Artists signed to the label
  artists: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    role: { type: String, enum: ["artist", "featured", "writer"], default: "artist" },
    signedAt: { type: Date, default: Date.now },
  }],
  
  // Label settings
  settings: {
    defaultRoyaltySplit: { type: Number, default: 50 }, // Percent to artist
    allowExternalEngineers: { type: Boolean, default: false },
    allowExternalProducers: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: true },
    aiToolsEnabled: { type: Boolean, default: true },
  },
  
  // Branding
  branding: {
    logoUrl: String,
    primaryColor: { type: String, default: "#ffb84d" },
    secondaryColor: { type: String, default: "#8b4513" },
  },
  
  // Stats
  stats: {
    totalTracks: { type: Number, default: 0 },
    totalBeats: { type: Number, default: 0 },
    totalEngineers: { type: Number, default: 0 },
    totalProducers: { type: Number, default: 0 },
  },
  
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Index for fast lookups
StudioLabelSchema.index({ slug: 1 });
StudioLabelSchema.index({ owners: 1 });
StudioLabelSchema.index({ "engineers.userId": 1 });
StudioLabelSchema.index({ "producers.userId": 1 });

// Check if user is owner
StudioLabelSchema.methods.isOwner = function(userId) {
  return this.owners.some(id => id.toString() === userId.toString());
};

// Check if user is authorized engineer
StudioLabelSchema.methods.isAuthorizedEngineer = function(userId) {
  if (this.isOwner(userId)) return true;
  return this.engineers.some(e => e.userId?.toString() === userId.toString());
};

// Check if user is authorized producer
StudioLabelSchema.methods.isAuthorizedProducer = function(userId) {
  if (this.isOwner(userId)) return true;
  return this.producers.some(p => p.userId?.toString() === userId.toString());
};

// Get user permissions
StudioLabelSchema.methods.getUserPermissions = function(userId) {
  if (this.isOwner(userId)) {
    return {
      isOwner: true,
      canDoAnything: true,
      engineer: { canMix: true, canMaster: true, canApplyFX: true, canExport: true, canAccessAI: true },
      producer: { canCreateBeats: true, canUseAIGenerator: true, canSellBeats: true, canAccessLibrary: true, canCollaborate: true },
    };
  }
  
  const engineer = this.engineers.find(e => e.userId?.toString() === userId.toString());
  const producer = this.producers.find(p => p.userId?.toString() === userId.toString());
  
  return {
    isOwner: false,
    canDoAnything: false,
    engineer: engineer?.permissions || null,
    producer: producer?.permissions || null,
  };
};

export default mongoose.model("StudioLabel", StudioLabelSchema);

