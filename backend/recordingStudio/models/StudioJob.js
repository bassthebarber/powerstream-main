// backend/recordingStudio/models/StudioJob.js
import mongoose from "mongoose";

// Constants
export const JOB_TYPES = {
  MIX: "mix",
  MASTER: "master",
  VOCAL_RECORDING: "vocal-recording",
  BEAT_PRODUCTION: "beat-production",
  FULL_PRODUCTION: "full-production",
  STEM_EXPORT: "stem-export",
  LIVE_SESSION: "live-session",
};

export const JOB_STATUS = {
  OPEN: "open",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in-progress",
  DELIVERED: "delivered",
  REVISION: "revision",
  APPROVED: "approved",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
};

export const DEFAULT_PRICING = {
  [JOB_TYPES.MIX]: 150,
  [JOB_TYPES.MASTER]: 75,
  [JOB_TYPES.VOCAL_RECORDING]: 200,
  [JOB_TYPES.BEAT_PRODUCTION]: 250,
  [JOB_TYPES.FULL_PRODUCTION]: 500,
  [JOB_TYPES.STEM_EXPORT]: 50,
  [JOB_TYPES.LIVE_SESSION]: 100,
};

const deliverableSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  uploadedAt: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false },
});

const revisionNoteSchema = new mongoose.Schema({
  note: String,
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  requestedAt: { type: Date, default: Date.now },
});

const studioJobSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveRoomSession" },
    studioSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioSession" },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioContract" },
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    engineerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { 
      type: String, 
      enum: Object.values(JOB_TYPES), 
      required: true 
    },
    title: { type: String, required: true },
    description: String,
    status: { 
      type: String, 
      enum: Object.values(JOB_STATUS), 
      default: JOB_STATUS.OPEN 
    },
    // Pricing
    basePrice: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    platformFeePercent: { type: Number, default: 10 },
    totalPrice: { type: Number, default: 0 },
    engineerPayout: { type: Number, default: 0 },
    // Royalties
    includesRoyalties: { type: Boolean, default: false },
    royaltyPercent: { type: Number, default: 0 },
    // Files
    inputFiles: [{
      name: String,
      url: String,
      type: String,
    }],
    deliverables: [deliverableSchema],
    // Revisions
    revisionCount: { type: Number, default: 0 },
    maxRevisions: { type: Number, default: 2 },
    revisionNotes: [revisionNoteSchema],
    // Dates
    dueDate: Date,
    startedAt: Date,
    deliveredAt: Date,
    approvedAt: Date,
    paidAt: Date,
    // Notes
    artistNotes: String,
    engineerNotes: String,
    adminNotes: String,
  },
  { timestamps: true }
);

// Calculate pricing
studioJobSchema.pre("save", function(next) {
  if (!this.basePrice && this.type) {
    this.basePrice = DEFAULT_PRICING[this.type] || 100;
  }
  this.platformFee = Math.round(this.basePrice * (this.platformFeePercent / 100));
  this.totalPrice = this.basePrice;
  this.engineerPayout = this.basePrice - this.platformFee;
  next();
});

// Instance methods
studioJobSchema.methods.getPricingSummary = function() {
  return {
    basePrice: this.basePrice,
    platformFee: this.platformFee,
    platformFeePercent: this.platformFeePercent,
    totalPrice: this.totalPrice,
    engineerPayout: this.engineerPayout,
    includesRoyalties: this.includesRoyalties,
    royaltyPercent: this.royaltyPercent,
  };
};

studioJobSchema.methods.assignEngineer = async function(engineerId) {
  this.engineerId = engineerId;
  this.status = JOB_STATUS.ASSIGNED;
  this.startedAt = new Date();
  await this.save();
  return this;
};

studioJobSchema.methods.submitDeliverable = async function(deliverable) {
  this.deliverables.push(deliverable);
  this.status = JOB_STATUS.DELIVERED;
  this.deliveredAt = new Date();
  await this.save();
  return this;
};

studioJobSchema.methods.requestRevision = async function(note, requestedBy) {
  if (this.revisionCount >= this.maxRevisions) {
    throw new Error("Maximum revisions reached");
  }
  this.revisionNotes.push({ note, requestedBy });
  this.revisionCount += 1;
  this.status = JOB_STATUS.REVISION;
  await this.save();
  return this;
};

studioJobSchema.methods.approve = async function() {
  this.status = JOB_STATUS.APPROVED;
  this.approvedAt = new Date();
  // Mark all deliverables as approved
  this.deliverables.forEach(d => d.approved = true);
  await this.save();
  return this;
};

studioJobSchema.index({ artistId: 1, status: 1 });
studioJobSchema.index({ engineerId: 1, status: 1 });
studioJobSchema.index({ type: 1, status: 1 });

export default mongoose.model("StudioJob", studioJobSchema);

