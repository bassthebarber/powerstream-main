// backend/models/RoyaltyRegistration.js
// Royalty Registration Model - Copyright & Ownership Ledger for SPS

import mongoose from "mongoose";

const royaltyRegistrationSchema = new mongoose.Schema(
  {
    // Reference to the creative work
    workId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "RoyaltyWork",
      required: false, // Optional - can register without existing work
    },

    // Basic info
    title: { 
      type: String, 
      required: true,
      trim: true,
    },
    description: { type: String },
    
    // Type of work
    type: { 
      type: String, 
      enum: ["song", "beat", "stem", "mix", "recording", "video", "album", "ep", "single"],
      required: true,
    },

    // Ownership structure
    owners: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, required: true },
        role: { 
          type: String, 
          enum: ["artist", "producer", "writer", "composer", "engineer", "label", "publisher", "manager", "performer"],
          required: true,
        },
        split: { type: Number, required: true, min: 0, max: 100 }, // percentage
        wallet: { type: String, default: "SPS_MASTER" }, // payment destination
        email: { type: String },
        pro: { type: String }, // PRO affiliation (ASCAP, BMI, SESAC)
        ipi: { type: String }, // IPI number
        isrc: { type: String }, // ISRC code
      }
    ],

    // AI Copyright Output
    copyrightSummary: { type: String },
    copyrightLegalText: { type: String },
    aiKeywords: [{ type: String }],
    aiGenre: { type: String },
    aiMood: [{ type: String }],

    // Work Metadata
    duration: { type: Number }, // seconds
    bpm: { type: Number },
    key: { type: String },
    genre: { type: String },
    releaseDate: { type: Date },
    language: { type: String, default: "English" },

    // File references
    masterFile: { type: String }, // URL to master file
    stemFiles: [{ 
      name: String, 
      url: String,
      type: String,
    }],
    artworkUrl: { type: String },

    // Registration details
    registeredAt: { type: Date, default: Date.now },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Blockchain-ready proof
    hashedProof: { type: String }, // SHA-256 hash for verification
    proofTimestamp: { type: Date },
    
    // Status
    status: { 
      type: String, 
      enum: ["draft", "pending", "registered", "verified", "disputed"],
      default: "registered",
    },

    // Distribution
    distributedTo: [{ 
      platform: String, // spotify, apple, youtube, etc.
      distributedAt: Date,
      externalId: String,
    }],

    // Licensing
    licenseType: { 
      type: String, 
      enum: ["all_rights_reserved", "creative_commons", "sync_available", "exclusive", "non_exclusive"],
      default: "all_rights_reserved",
    },
    syncAvailable: { type: Boolean, default: false },
    syncPrice: { type: Number },

    // Platform reference
    stationId: { type: mongoose.Schema.Types.ObjectId },
    projectId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// Indexes
royaltyRegistrationSchema.index({ workId: 1 });
royaltyRegistrationSchema.index({ title: "text", description: "text" });
royaltyRegistrationSchema.index({ "owners.userId": 1 });
royaltyRegistrationSchema.index({ "owners.name": 1 });
royaltyRegistrationSchema.index({ type: 1 });
royaltyRegistrationSchema.index({ status: 1 });
royaltyRegistrationSchema.index({ hashedProof: 1 });
royaltyRegistrationSchema.index({ registeredAt: -1 });
royaltyRegistrationSchema.index({ createdAt: -1 });

// Virtual to get total split percentage
royaltyRegistrationSchema.virtual("totalSplit").get(function() {
  return this.owners.reduce((sum, owner) => sum + (owner.split || 0), 0);
});

// Method to verify ownership split adds to 100%
royaltyRegistrationSchema.methods.validateSplits = function() {
  const total = this.owners.reduce((sum, owner) => sum + (owner.split || 0), 0);
  return Math.abs(total - 100) < 0.01; // Allow small floating point errors
};

// Static method to find by owner
royaltyRegistrationSchema.statics.findByOwner = function(userId) {
  return this.find({ "owners.userId": userId }).sort({ registeredAt: -1 });
};

// Static method to find by hash
royaltyRegistrationSchema.statics.findByHash = function(hash) {
  return this.findOne({ hashedProof: hash });
};

const RoyaltyRegistration = mongoose.model("RoyaltyRegistration", royaltyRegistrationSchema);

export default RoyaltyRegistration;

