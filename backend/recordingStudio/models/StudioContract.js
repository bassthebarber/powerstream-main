// backend/recordingStudio/models/StudioContract.js
import mongoose from "mongoose";

export const CONTRACT_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
};

const studioContractSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioJob", required: true },
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    engineerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(CONTRACT_STATUS),
      default: CONTRACT_STATUS.DRAFT,
    },
    // Terms
    terms: {
      deliverables: [String],
      turnaroundDays: { type: Number, default: 7 },
      maxRevisions: { type: Number, default: 2 },
      royaltySplit: {
        artist: { type: Number, default: 100 },
        engineer: { type: Number, default: 0 },
      },
      masterOwnership: {
        type: String,
        enum: ["artist", "engineer", "shared", "platform"],
        default: "artist",
      },
    },
    // Pricing
    agreedPrice: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    engineerPayout: { type: Number, default: 0 },
    // Signatures (timestamps when agreed)
    artistSignedAt: Date,
    engineerSignedAt: Date,
    // Completion
    completedAt: Date,
    paidOutAt: Date,
    // Dispute
    disputeReason: String,
    disputeResolvedAt: Date,
    disputeResolution: String,
  },
  { timestamps: true }
);

// Instance methods
studioContractSchema.methods.signByArtist = async function() {
  this.artistSignedAt = new Date();
  if (this.engineerSignedAt) {
    this.status = CONTRACT_STATUS.ACTIVE;
  } else {
    this.status = CONTRACT_STATUS.PENDING;
  }
  await this.save();
  return this;
};

studioContractSchema.methods.signByEngineer = async function() {
  this.engineerSignedAt = new Date();
  if (this.artistSignedAt) {
    this.status = CONTRACT_STATUS.ACTIVE;
  } else {
    this.status = CONTRACT_STATUS.PENDING;
  }
  await this.save();
  return this;
};

studioContractSchema.methods.complete = async function() {
  this.status = CONTRACT_STATUS.COMPLETED;
  this.completedAt = new Date();
  await this.save();
  return this;
};

studioContractSchema.index({ jobId: 1 });
studioContractSchema.index({ artistId: 1, status: 1 });
studioContractSchema.index({ engineerId: 1, status: 1 });

export default mongoose.model("StudioContract", studioContractSchema);

