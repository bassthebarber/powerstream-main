// backend/models/EngineerAccessCode.js
// Engineer/Producer Access Codes for Studio Control
import mongoose from "mongoose";

const engineerAccessCodeSchema = new mongoose.Schema(
  {
    // The access code (6-character alphanumeric)
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    
    // Label/Studio this code belongs to
    labelSlug: {
      type: String,
      required: true,
      default: "no-limit-east-houston",
      index: true,
    },
    
    // Who created this code (admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Who this code is assigned to
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedName: {
      type: String,
      default: "",
    },
    
    // Role granted by this code
    role: {
      type: String,
      enum: ["engineer", "producer", "mixer", "master_engineer", "full_access"],
      default: "engineer",
    },
    
    // Permissions
    permissions: {
      canMix: { type: Boolean, default: true },
      canMaster: { type: Boolean, default: false },
      canExport: { type: Boolean, default: true },
      canDeleteTakes: { type: Boolean, default: false },
      canAccessAI: { type: Boolean, default: false },
      canControlSession: { type: Boolean, default: true },
      canInviteOthers: { type: Boolean, default: false },
    },
    
    // Status
    status: {
      type: String,
      enum: ["active", "used", "expired", "revoked"],
      default: "active",
    },
    
    // Usage tracking
    usedAt: { type: Date },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Expiration
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    
    // Session info when plugged in
    activeSession: {
      sessionId: String,
      pluggedInAt: Date,
      lastActivity: Date,
    },
  },
  { timestamps: true }
);

// Generate a random 6-character code
engineerAccessCodeSchema.statics.generateCode = function() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Check if code is valid
engineerAccessCodeSchema.methods.isValid = function() {
  if (this.status !== "active") return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

const EngineerAccessCode = mongoose.model("EngineerAccessCode", engineerAccessCodeSchema);

export default EngineerAccessCode;

