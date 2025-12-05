// backend/recordingStudio/models/StudioJob.js
// Studio Job Model - Paid tasks like mixing, mastering, beat production
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import mongoose from "mongoose";

/**
 * Studio job types
 */
export const JOB_TYPES = {
  RECORDING: "recording",       // Recording session
  MIX: "mix",                   // Mix a track
  MASTER: "master",             // Master a track
  BEAT: "beat",                 // Custom beat production
  FULL_PRODUCTION: "full_production", // Full song production
  VOCAL_TUNING: "vocal_tuning", // Auto-tune / vocal editing
  STEM_SPLIT: "stem_split",     // Split track into stems
  HOOK: "hook",                 // Write/produce a hook
  FEATURE: "feature",           // Feature verse/collab
};

/**
 * Job statuses
 */
export const JOB_STATUS = {
  OPEN: "open",               // Job created, waiting for engineer
  IN_PROGRESS: "in_progress", // Engineer working on it
  DELIVERED: "delivered",     // Engineer submitted deliverables
  REVISION: "revision",       // Artist requested changes
  APPROVED: "approved",       // Artist approved the work
  PAID: "paid",               // Payment processed
  CANCELLED: "cancelled",     // Job cancelled
  DISPUTED: "disputed",       // Payment dispute
};

/**
 * Default pricing tiers (in cents to avoid float issues)
 */
export const DEFAULT_PRICING = {
  recording: 5000,      // $50
  mix: 10000,           // $100
  master: 7500,         // $75
  beat: 15000,          // $150
  full_production: 50000, // $500
  vocal_tuning: 2500,   // $25
  stem_split: 2000,     // $20
  hook: 20000,          // $200
  feature: 30000,       // $300
};

/**
 * StudioJob Schema
 * Represents a paid task in the studio (mixing, mastering, etc.)
 */
const StudioJobSchema = new mongoose.Schema(
  {
    // ============================================================
    // LINKED ENTITIES
    // ============================================================
    sessionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "LiveRoomSession",
    },
    studioSessionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "StudioSession",
    },
    artistId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true,
    },
    engineerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      index: true,
    },

    // ============================================================
    // JOB DETAILS
    // ============================================================
    type: { 
      type: String, 
      enum: Object.values(JOB_TYPES),
      required: true,
      index: true,
    },
    title: { 
      type: String, 
      default: function() {
        return `${this.type} Job`;
      },
    },
    description: { type: String, default: "" },
    status: { 
      type: String, 
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.OPEN,
      index: true,
    },

    // ============================================================
    // PRICING (all amounts in cents to avoid float issues)
    // ============================================================
    basePrice: { 
      type: Number, 
      required: true,
      min: 0,
    },
    platformFeePercent: { 
      type: Number, 
      default: 15, // 15% platform fee
      min: 0,
      max: 100,
    },
    engineerSharePercent: { 
      type: Number, 
      default: 85, // 85% to engineer (100% - platform fee)
      min: 0,
      max: 100,
    },
    currency: { 
      type: String, 
      default: "USD",
      enum: ["USD", "EUR", "GBP", "CAD"],
    },

    // Calculated amounts (stored for record keeping)
    platformFeeAmount: { type: Number, default: 0 },
    engineerAmount: { type: Number, default: 0 },
    
    // Royalty sharing (if applicable)
    includesRoyalties: { type: Boolean, default: false },
    royaltyPercent: { type: Number, default: 0, min: 0, max: 100 },

    // ============================================================
    // DELIVERABLES
    // ============================================================
    inputFiles: [{
      name: { type: String },
      url: { type: String },
      type: { type: String }, // vocal, beat, reference
      uploadedAt: { type: Date, default: Date.now },
    }],
    deliverables: [{
      name: { type: String },
      url: { type: String },
      type: { type: String }, // mix, master, stems
      uploadedAt: { type: Date, default: Date.now },
      approved: { type: Boolean, default: false },
    }],

    // ============================================================
    // REVISION TRACKING
    // ============================================================
    revisionCount: { type: Number, default: 0 },
    maxRevisions: { type: Number, default: 2 },
    revisionNotes: [{
      note: { type: String },
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      requestedAt: { type: Date, default: Date.now },
      resolvedAt: { type: Date },
    }],

    // ============================================================
    // TIMELINE
    // ============================================================
    dueDate: { type: Date },
    startedAt: { type: Date },
    deliveredAt: { type: Date },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    cancelledAt: { type: Date },

    // ============================================================
    // PAYMENT TRACKING
    // ============================================================
    paymentMethod: { 
      type: String, 
      enum: ["coins", "stripe", "paypal", "manual"],
    },
    paymentTransactionId: { type: String },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "processing", "completed", "failed", "refunded"],
    },

    // ============================================================
    // CONTRACT REFERENCE
    // ============================================================
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioContract" },

    // ============================================================
    // NOTES & METADATA
    // ============================================================
    artistNotes: { type: String, default: "" },
    engineerNotes: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
    tags: [{ type: String }],
  },
  { 
    timestamps: true,
    collection: "studio_jobs",
  }
);

// ============================================================
// INDEXES
// ============================================================
StudioJobSchema.index({ artistId: 1, status: 1 });
StudioJobSchema.index({ engineerId: 1, status: 1 });
StudioJobSchema.index({ type: 1, status: 1 });
StudioJobSchema.index({ createdAt: -1 });

// ============================================================
// PRE-SAVE HOOKS
// ============================================================

/**
 * Calculate fee amounts before saving
 */
StudioJobSchema.pre("save", function (next) {
  // Ensure percentages add up
  if (this.platformFeePercent + this.engineerSharePercent !== 100) {
    this.engineerSharePercent = 100 - this.platformFeePercent;
  }
  
  // Calculate amounts
  this.platformFeeAmount = Math.round(this.basePrice * this.platformFeePercent / 100);
  this.engineerAmount = this.basePrice - this.platformFeeAmount;
  
  next();
});

// ============================================================
// METHODS
// ============================================================

/**
 * Assign an engineer to this job
 */
StudioJobSchema.methods.assignEngineer = function (engineerId) {
  this.engineerId = engineerId;
  this.status = JOB_STATUS.IN_PROGRESS;
  this.startedAt = new Date();
  return this.save();
};

/**
 * Submit deliverables
 */
StudioJobSchema.methods.submitDeliverable = function (deliverable) {
  this.deliverables.push({
    ...deliverable,
    uploadedAt: new Date(),
  });
  this.status = JOB_STATUS.DELIVERED;
  this.deliveredAt = new Date();
  return this.save();
};

/**
 * Request revision
 */
StudioJobSchema.methods.requestRevision = function (note, requestedBy) {
  if (this.revisionCount >= this.maxRevisions) {
    throw new Error(`Maximum revisions (${this.maxRevisions}) reached`);
  }
  
  this.revisionNotes.push({
    note,
    requestedBy,
    requestedAt: new Date(),
  });
  this.revisionCount++;
  this.status = JOB_STATUS.REVISION;
  return this.save();
};

/**
 * Approve the job
 */
StudioJobSchema.methods.approve = function () {
  this.status = JOB_STATUS.APPROVED;
  this.approvedAt = new Date();
  // Mark all deliverables as approved
  this.deliverables.forEach(d => d.approved = true);
  return this.save();
};

/**
 * Mark as paid
 */
StudioJobSchema.methods.markPaid = function (transactionId, method = "coins") {
  this.status = JOB_STATUS.PAID;
  this.paidAt = new Date();
  this.paymentTransactionId = transactionId;
  this.paymentMethod = method;
  this.paymentStatus = "completed";
  return this.save();
};

/**
 * Cancel the job
 */
StudioJobSchema.methods.cancel = function (reason = "") {
  this.status = JOB_STATUS.CANCELLED;
  this.cancelledAt = new Date();
  if (reason) {
    this.adminNotes = `Cancelled: ${reason}`;
  }
  return this.save();
};

/**
 * Get pricing summary
 */
StudioJobSchema.methods.getPricingSummary = function () {
  return {
    basePrice: this.basePrice,
    basePriceFormatted: `$${(this.basePrice / 100).toFixed(2)}`,
    platformFeePercent: this.platformFeePercent,
    platformFeeAmount: this.platformFeeAmount,
    platformFeeFormatted: `$${(this.platformFeeAmount / 100).toFixed(2)}`,
    engineerSharePercent: this.engineerSharePercent,
    engineerAmount: this.engineerAmount,
    engineerAmountFormatted: `$${(this.engineerAmount / 100).toFixed(2)}`,
    currency: this.currency,
    includesRoyalties: this.includesRoyalties,
    royaltyPercent: this.royaltyPercent,
  };
};

// ============================================================
// STATICS
// ============================================================

/**
 * Get jobs for an engineer
 */
StudioJobSchema.statics.getJobsForEngineer = function (engineerId, status = null) {
  const query = { engineerId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 }).populate("artistId", "name email avatarUrl");
};

/**
 * Get jobs for an artist
 */
StudioJobSchema.statics.getJobsForArtist = function (artistId, status = null) {
  const query = { artistId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 }).populate("engineerId", "name email avatarUrl");
};

/**
 * Get open jobs (for engineer assignment)
 */
StudioJobSchema.statics.getOpenJobs = function (type = null) {
  const query = { status: JOB_STATUS.OPEN };
  if (type) query.type = type;
  return this.find(query).sort({ createdAt: -1 }).populate("artistId", "name email avatarUrl");
};

/**
 * Get default price for a job type
 */
StudioJobSchema.statics.getDefaultPrice = function (jobType) {
  return DEFAULT_PRICING[jobType] || 10000; // Default $100
};

const StudioJob = mongoose.models.StudioJob || mongoose.model("StudioJob", StudioJobSchema);

export default StudioJob;
export { StudioJobSchema, JOB_TYPES, JOB_STATUS, DEFAULT_PRICING };

