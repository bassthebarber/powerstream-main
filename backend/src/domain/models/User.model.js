// backend/src/domain/models/User.model.js
// Canonical User model for PowerStream
// Migrated from /backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User roles for RBAC
 */
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  STATION_OWNER: "stationOwner",
  FINANCE: "finance",
  LEGAL: "legal",
  INVESTOR: "investor",
  CREATOR: "creator",
  MODERATOR: "moderator",
  // AI Studio roles (Live Room & Engineer Contract Mode)
  ARTIST: "artist",       // Records vocals, uses studio services
  ENGINEER: "engineer",   // Mixes, masters, produces for artists
};

/**
 * User labels/tiers
 */
export const USER_LABELS = {
  STANDARD: "STANDARD",
  NO_LIMIT_EAST_HOUSTON: "NO_LIMIT_EAST_HOUSTON",
  LABEL_ADMIN: "LABEL_ADMIN",
};

/**
 * User account status
 */
export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BANNED: "banned",
  PENDING: "pending",
};

const UserSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC INFO
    // ============================================================
    name: { type: String, trim: true, default: "" },
    username: { type: String, trim: true, sparse: true, unique: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: { type: String, required: true, minlength: 6 },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    website: { type: String, default: "" },
    location: { type: String, default: "" },

    // ============================================================
    // ROLE-BASED ACCESS CONTROL (RBAC)
    // ============================================================
    // Primary role (for backwards compatibility)
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    // Multi-role support (preferred going forward)
    roles: {
      type: [String],
      default: [USER_ROLES.USER],
    },

    // ============================================================
    // LABEL / TIER AFFILIATION
    // ============================================================
    label: {
      type: String,
      enum: Object.values(USER_LABELS),
      default: USER_LABELS.STANDARD,
    },

    // ============================================================
    // ACCOUNT CONTROL FLAGS
    // ============================================================
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    // Admin flag (legacy compatibility)
    isAdmin: { type: Boolean, default: false },

    // ============================================================
    // MONETIZATION
    // ============================================================
    coinBalance: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },

    // ============================================================
    // SOCIAL METRICS (denormalized for performance)
    // ============================================================
    followersCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
    postsCount: { type: Number, default: 0, min: 0 },

    // ============================================================
    // SETTINGS & PREFERENCES
    // ============================================================
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      privacy: {
        showOnlineStatus: { type: Boolean, default: true },
        allowMessages: { type: String, enum: ["everyone", "followers", "none"], default: "everyone" },
      },
      theme: { type: String, default: "dark" },
    },

    // ============================================================
    // AUTH & SECURITY
    // ============================================================
    refreshToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    lastLoginAt: { type: Date },
    lastActiveAt: { type: Date },

    // ============================================================
    // OAUTH & LINKED ACCOUNTS
    // ============================================================
    linkedAccounts: {
      google: { id: String, email: String },
      apple: { id: String, email: String },
      twitter: { id: String, username: String },
    },
  },
  { 
    timestamps: true,
    collection: "users",
  }
);

// ============================================================
// INDEXES
// ============================================================
UserSchema.index({ username: 1 }, { sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastActiveAt: -1 });

// ============================================================
// PRE-SAVE HOOKS
// ============================================================

// Encrypt password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Ensure roles array always contains the primary role
UserSchema.pre("save", function (next) {
  if (!Array.isArray(this.roles) || this.roles.length === 0) {
    this.roles = [this.role || USER_ROLES.USER];
  } else if (this.role && !this.roles.includes(this.role)) {
    this.roles.unshift(this.role);
  }
  
  // Sync isAdmin flag with admin role
  if (this.roles.includes(USER_ROLES.ADMIN) || this.role === USER_ROLES.ADMIN) {
    this.isAdmin = true;
  }
  
  next();
});

// ============================================================
// METHODS
// ============================================================

// Compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive fields when sending user data
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  return obj;
};

// Check if user has a specific role
UserSchema.methods.hasRole = function (role) {
  return this.roles.includes(role) || this.role === role;
};

// Check if user is admin
UserSchema.methods.isAdminUser = function () {
  return this.isAdmin || this.hasRole(USER_ROLES.ADMIN);
};

// Get public profile (safe to return to other users)
UserSchema.methods.getPublicProfile = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    username: this.username,
    avatarUrl: this.avatarUrl,
    bio: this.bio,
    isVerified: this.isVerified,
    followersCount: this.followersCount,
    followingCount: this.followingCount,
    postsCount: this.postsCount,
  };
};

// ============================================================
// STATICS
// ============================================================

// Find user by email (case-insensitive)
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Find user by username
UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: username.toLowerCase().trim() });
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
export { UserSchema };

