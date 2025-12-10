// backend/models/User.js
// DEPRECATED: Model moved to /src/domain/models/User.model.js
// This file remains for backward compatibility with existing imports.
// TODO: Update all imports to use /src/domain/models/User.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true, // ✅ this alone defines the unique index
    },
    password: { type: String, required: true, minlength: 6 },
    avatarUrl: { type: String, default: "" },

    // ✅ Role-based Access Control (RBAC)
    // Primary role (for backwards compatibility)
    role: {
      type: String,
      enum: ["user", "admin", "stationOwner", "finance", "legal", "investor"],
      default: "user",
    },
    // Multi-role support (preferred going forward)
    roles: {
      type: [String],
      default: ["user"],
    },

    // ✅ Label / Tier affiliation
    label: {
      type: String,
      enum: ["STANDARD", "NO_LIMIT_EAST_HOUSTON", "LABEL_ADMIN"],
      default: "STANDARD",
    },

    // ✅ Account control flags
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
    },

    // ✅ Admin flag (legacy compatibility)
    isAdmin: { type: Boolean, default: false },

    // ✅ Coin balance for PowerCoins
    coinBalance: { type: Number, default: 0, min: 0 },

    // ✅ Social graph - following/followers
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ✅ Encrypt password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Hide sensitive fields when sending user data
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Ensure roles array always contains the primary role
UserSchema.pre("save", function (next) {
  if (!Array.isArray(this.roles) || this.roles.length === 0) {
    this.roles = [this.role || "user"];
  } else if (this.role && !this.roles.includes(this.role)) {
    this.roles.unshift(this.role);
  }
  next();
});

// Use existing model or create new
export default mongoose.models.User || mongoose.model("User", UserSchema);
