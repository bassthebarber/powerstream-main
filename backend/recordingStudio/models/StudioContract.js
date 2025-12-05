// backend/recordingStudio/models/StudioContract.js
// Studio Contract Model - Legal agreements for studio services
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import mongoose from "mongoose";

/**
 * Contract statuses
 */
export const CONTRACT_STATUS = {
  DRAFT: "draft",             // Contract created, not yet sent
  SENT: "sent",               // Sent to parties for review
  SIGNED_ARTIST: "signed_artist",   // Artist has signed
  SIGNED_ENGINEER: "signed_engineer", // Engineer has signed
  ACTIVE: "active",           // Both parties signed, work can begin
  COMPLETED: "completed",     // Work finished, contract fulfilled
  CANCELLED: "cancelled",     // Contract cancelled
  DISPUTED: "disputed",       // Under dispute
  EXPIRED: "expired",         // Contract expired before completion
};

/**
 * Contract types
 */
export const CONTRACT_TYPES = {
  WORK_FOR_HIRE: "work_for_hire",     // Engineer produces for flat fee
  ROYALTY_SPLIT: "royalty_split",     // Revenue sharing agreement
  LICENSE: "license",                  // License to use beat/production
  COLLABORATION: "collaboration",      // Joint creation with shared rights
  FEATURE: "feature",                  // Feature/guest appearance
};

/**
 * StudioContract Schema
 * Legal agreement between artist, engineer, and platform
 */
const StudioContractSchema = new mongoose.Schema(
  {
    // ============================================================
    // LINKED ENTITIES
    // ============================================================
    jobId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "StudioJob",
      required: true,
      index: true,
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
    // Platform is always a party (for fee collection)
    platformId: { 
      type: String, 
      default: "powerstream_platform",
    },

    // ============================================================
    // CONTRACT IDENTITY
    // ============================================================
    contractNumber: { 
      type: String, 
      unique: true,
      default: function() {
        const date = new Date();
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `PS-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${rand}`;
      },
    },
    type: { 
      type: String, 
      enum: Object.values(CONTRACT_TYPES),
      default: CONTRACT_TYPES.WORK_FOR_HIRE,
    },
    status: { 
      type: String, 
      enum: Object.values(CONTRACT_STATUS),
      default: CONTRACT_STATUS.DRAFT,
      index: true,
    },

    // ============================================================
    // CONTRACT TERMS (Human-readable)
    // ============================================================
    title: { type: String, default: "Studio Services Agreement" },
    terms: { type: String, default: "" }, // Full contract text
    termsSummary: { type: String, default: "" }, // Brief summary
    
    // Structured terms for programmatic access
    structuredTerms: {
      serviceDescription: { type: String, default: "" },
      deliverables: [{ type: String }],
      deadlines: {
        startDate: { type: Date },
        deliveryDate: { type: Date },
        expirationDate: { type: Date },
      },
      revisionPolicy: {
        maxRevisions: { type: Number, default: 2 },
        revisionFee: { type: Number, default: 0 }, // Additional fee per revision
      },
      cancellationPolicy: {
        artistCanCancel: { type: Boolean, default: true },
        engineerCanCancel: { type: Boolean, default: true },
        cancellationFee: { type: Number, default: 0 },
        refundPercent: { type: Number, default: 100 }, // Refund % if cancelled
      },
      disputeResolution: { type: String, default: "Platform mediation" },
    },

    // ============================================================
    // PRICING BREAKDOWN
    // ============================================================
    pricing: {
      totalPrice: { type: Number, required: true }, // in cents
      platformFeePercent: { type: Number, default: 15 },
      platformFeeAmount: { type: Number, default: 0 },
      engineerPercent: { type: Number, default: 85 },
      engineerAmount: { type: Number, default: 0 },
      
      // Royalty terms (if applicable)
      includesRoyalties: { type: Boolean, default: false },
      royaltyPercent: { type: Number, default: 0 },
      royaltySplits: [{
        party: { type: String }, // "artist", "engineer", "platform"
        percent: { type: Number },
      }],
    },

    // ============================================================
    // SIGNATURES
    // ============================================================
    signatures: {
      artist: {
        signed: { type: Boolean, default: false },
        signedAt: { type: Date },
        ipAddress: { type: String },
        userAgent: { type: String },
        signatureData: { type: String }, // Base64 signature image or hash
      },
      engineer: {
        signed: { type: Boolean, default: false },
        signedAt: { type: Date },
        ipAddress: { type: String },
        userAgent: { type: String },
        signatureData: { type: String },
      },
      platform: {
        signed: { type: Boolean, default: true }, // Auto-signed by platform
        signedAt: { type: Date, default: Date.now },
        signatureData: { type: String, default: "POWERSTREAM_PLATFORM_AUTO_SIGNATURE" },
      },
    },

    // ============================================================
    // LIFECYCLE TRACKING
    // ============================================================
    sentAt: { type: Date },
    activatedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    expiresAt: { type: Date },

    // ============================================================
    // LEGAL & COMPLIANCE
    // ============================================================
    governingLaw: { type: String, default: "State of Texas, USA" },
    version: { type: Number, default: 1 },
    amendments: [{
      description: { type: String },
      amendedAt: { type: Date },
      approvedByArtist: { type: Boolean },
      approvedByEngineer: { type: Boolean },
    }],

    // ============================================================
    // METADATA
    // ============================================================
    notes: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
  },
  { 
    timestamps: true,
    collection: "studio_contracts",
  }
);

// ============================================================
// INDEXES
// ============================================================
StudioContractSchema.index({ jobId: 1 });
StudioContractSchema.index({ artistId: 1, status: 1 });
StudioContractSchema.index({ engineerId: 1, status: 1 });
StudioContractSchema.index({ contractNumber: 1 }, { unique: true });
StudioContractSchema.index({ createdAt: -1 });

// ============================================================
// PRE-SAVE HOOKS
// ============================================================

/**
 * Calculate pricing amounts
 */
StudioContractSchema.pre("save", function (next) {
  // Calculate platform fee and engineer amounts
  if (this.pricing.totalPrice) {
    this.pricing.platformFeeAmount = Math.round(
      this.pricing.totalPrice * this.pricing.platformFeePercent / 100
    );
    this.pricing.engineerAmount = this.pricing.totalPrice - this.pricing.platformFeeAmount;
  }
  
  // Update status based on signatures
  if (this.signatures.artist.signed && this.signatures.engineer.signed) {
    if (this.status === CONTRACT_STATUS.SIGNED_ARTIST || 
        this.status === CONTRACT_STATUS.SIGNED_ENGINEER ||
        this.status === CONTRACT_STATUS.SENT) {
      this.status = CONTRACT_STATUS.ACTIVE;
      this.activatedAt = new Date();
    }
  } else if (this.signatures.artist.signed && !this.signatures.engineer.signed) {
    this.status = CONTRACT_STATUS.SIGNED_ARTIST;
  } else if (this.signatures.engineer.signed && !this.signatures.artist.signed) {
    this.status = CONTRACT_STATUS.SIGNED_ENGINEER;
  }
  
  next();
});

// ============================================================
// METHODS
// ============================================================

/**
 * Generate contract text from template
 */
StudioContractSchema.methods.generateContractText = function (artist, engineer) {
  const job = this.jobId; // Assumes populated
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const text = `
POWERSTREAM STUDIO SERVICES AGREEMENT
Contract Number: ${this.contractNumber}
Date: ${date}

PARTIES:
1. Client ("Artist"): ${artist?.name || "Artist"}
   Email: ${artist?.email || "N/A"}

2. Service Provider ("Engineer"): ${engineer?.name || "To Be Assigned"}
   Email: ${engineer?.email || "N/A"}

3. Platform ("PowerStream"): Southern Power Syndicate / PowerStream TV Music
   Platform ID: ${this.platformId}

SERVICE TYPE: ${this.type.replace(/_/g, " ").toUpperCase()}

SCOPE OF WORK:
${this.structuredTerms.serviceDescription || "Recording, mixing, and/or mastering services as specified in the job description."}

DELIVERABLES:
${(this.structuredTerms.deliverables || ["Final audio files in WAV and MP3 format"]).map((d, i) => `${i + 1}. ${d}`).join("\n")}

COMPENSATION:
- Total Price: $${(this.pricing.totalPrice / 100).toFixed(2)} ${this.pricing.currency || "USD"}
- Platform Fee (${this.pricing.platformFeePercent}%): $${(this.pricing.platformFeeAmount / 100).toFixed(2)}
- Engineer Payment (${this.pricing.engineerPercent}%): $${(this.pricing.engineerAmount / 100).toFixed(2)}

${this.pricing.includesRoyalties ? `
ROYALTY TERMS:
- Royalty Percentage: ${this.pricing.royaltyPercent}%
- Split: ${(this.pricing.royaltySplits || []).map(s => `${s.party}: ${s.percent}%`).join(", ")}
` : ""}

REVISION POLICY:
- Included Revisions: ${this.structuredTerms.revisionPolicy?.maxRevisions || 2}
- Additional Revision Fee: $${((this.structuredTerms.revisionPolicy?.revisionFee || 0) / 100).toFixed(2)}

CANCELLATION POLICY:
- Refund: ${this.structuredTerms.cancellationPolicy?.refundPercent || 100}% if cancelled before work begins
- Cancellation Fee: $${((this.structuredTerms.cancellationPolicy?.cancellationFee || 0) / 100).toFixed(2)}

INTELLECTUAL PROPERTY:
${this.type === CONTRACT_TYPES.WORK_FOR_HIRE 
  ? "All work product shall be considered 'work for hire' and shall belong exclusively to the Artist upon full payment."
  : "Rights shall be shared according to the royalty split specified above."}

GOVERNING LAW:
This Agreement shall be governed by the laws of ${this.governingLaw}.

DISPUTE RESOLUTION:
${this.structuredTerms.disputeResolution || "Disputes shall be resolved through Platform mediation, followed by binding arbitration if necessary."}

By signing below, all parties agree to the terms and conditions set forth in this Agreement.

_________________________________
Artist Signature / Date

_________________________________
Engineer Signature / Date

_________________________________
PowerStream Platform (Auto-Signed)

Contract Version: ${this.version}
Generated: ${new Date().toISOString()}
  `.trim();
  
  return text;
};

/**
 * Sign the contract as a party
 */
StudioContractSchema.methods.sign = async function (party, signatureData, ipAddress, userAgent) {
  if (!["artist", "engineer"].includes(party)) {
    throw new Error("Invalid signing party");
  }
  
  this.signatures[party] = {
    signed: true,
    signedAt: new Date(),
    ipAddress,
    userAgent,
    signatureData: signatureData || `ELECTRONIC_SIGNATURE_${party.toUpperCase()}`,
  };
  
  return this.save();
};

/**
 * Check if contract is fully signed
 */
StudioContractSchema.methods.isFullySigned = function () {
  return this.signatures.artist.signed && this.signatures.engineer.signed;
};

/**
 * Complete the contract
 */
StudioContractSchema.methods.complete = function () {
  this.status = CONTRACT_STATUS.COMPLETED;
  this.completedAt = new Date();
  return this.save();
};

/**
 * Cancel the contract
 */
StudioContractSchema.methods.cancel = function (reason = "") {
  this.status = CONTRACT_STATUS.CANCELLED;
  this.cancelledAt = new Date();
  if (reason) {
    this.notes = `Cancelled: ${reason}`;
  }
  return this.save();
};

/**
 * Get pricing summary for display
 */
StudioContractSchema.methods.getPricingSummary = function () {
  return {
    total: `$${(this.pricing.totalPrice / 100).toFixed(2)}`,
    platformFee: `$${(this.pricing.platformFeeAmount / 100).toFixed(2)} (${this.pricing.platformFeePercent}%)`,
    engineerPayout: `$${(this.pricing.engineerAmount / 100).toFixed(2)} (${this.pricing.engineerPercent}%)`,
    includesRoyalties: this.pricing.includesRoyalties,
    royaltyPercent: this.pricing.royaltyPercent,
  };
};

// ============================================================
// STATICS
// ============================================================

/**
 * Find contract by job ID
 */
StudioContractSchema.statics.findByJobId = function (jobId) {
  return this.findOne({ jobId }).populate("artistId engineerId");
};

/**
 * Get contracts for a user (artist or engineer)
 */
StudioContractSchema.statics.getContractsForUser = function (userId, role = "artist") {
  const query = role === "artist" ? { artistId: userId } : { engineerId: userId };
  return this.find(query).sort({ createdAt: -1 }).populate("jobId artistId engineerId");
};

/**
 * Get pending contracts (need signature)
 */
StudioContractSchema.statics.getPendingContracts = function (userId, role = "artist") {
  const query = role === "artist" 
    ? { artistId: userId, "signatures.artist.signed": false }
    : { engineerId: userId, "signatures.engineer.signed": false };
  
  query.status = { $in: [CONTRACT_STATUS.SENT, CONTRACT_STATUS.SIGNED_ARTIST, CONTRACT_STATUS.SIGNED_ENGINEER] };
  
  return this.find(query).sort({ createdAt: -1 }).populate("jobId artistId engineerId");
};

const StudioContract = mongoose.models.StudioContract || 
  mongoose.model("StudioContract", StudioContractSchema);

export default StudioContract;
export { StudioContractSchema, CONTRACT_STATUS, CONTRACT_TYPES };

