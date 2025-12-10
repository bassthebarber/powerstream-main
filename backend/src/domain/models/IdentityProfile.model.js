// backend/src/domain/models/IdentityProfile.model.js
// Unified Identity Graph (UIG) - Cross-app identity and preferences
import mongoose from "mongoose";

/**
 * Identity Profile Model
 * Unified identity across all PowerStream apps (Feed, Gram, Reel, TV, Studio, etc.)
 */
const IdentityProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    
    // Global handle (unique username across all apps)
    globalHandle: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9_]{3,30}$/,
    },
    
    // Display name
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    
    // Bio
    bio: {
      type: String,
      maxlength: 500,
    },
    
    // Linked apps (which PowerStream apps the user has activated)
    linkedApps: {
      feed: { type: Boolean, default: true },
      gram: { type: Boolean, default: false },
      reel: { type: Boolean, default: false },
      line: { type: Boolean, default: false },
      tv: { type: Boolean, default: false },
      studio: { type: Boolean, default: false },
      coins: { type: Boolean, default: false },
    },
    
    // App-specific profiles/handles (if different)
    appProfiles: {
      studio: {
        artistName: String,
        recordLabel: String,
        genres: [String],
      },
      tv: {
        channelName: String,
        isVerifiedBroadcaster: { type: Boolean, default: false },
      },
    },
    
    // Global preferences
    preferences: {
      // Theme
      theme: {
        type: String,
        enum: ["dark", "light", "system", "powerstream"],
        default: "powerstream",
      },
      
      // Language
      language: {
        type: String,
        default: "en",
      },
      
      // Content filters
      contentFilters: {
        matureContent: { type: Boolean, default: false },
        explicitMusic: { type: Boolean, default: false },
        hideRecommended: { type: Boolean, default: false },
      },
      
      // Notification preferences
      notifications: {
        likes: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        follows: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        liveStreams: { type: Boolean, default: true },
        tips: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      
      // Privacy settings
      privacy: {
        profileVisibility: {
          type: String,
          enum: ["public", "followers", "private"],
          default: "public",
        },
        showOnlineStatus: { type: Boolean, default: true },
        allowMessages: {
          type: String,
          enum: ["everyone", "followers", "none"],
          default: "everyone",
        },
        showActivity: { type: Boolean, default: true },
      },
      
      // Feed preferences
      feed: {
        autoplayVideos: { type: Boolean, default: true },
        showStories: { type: Boolean, default: true },
        chronologicalFeed: { type: Boolean, default: false },
      },
      
      // Studio preferences
      studio: {
        defaultBPM: { type: Number, default: 120 },
        defaultKey: { type: String, default: "C" },
        autoSave: { type: Boolean, default: true },
      },
    },
    
    // Verification status
    verification: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: Date,
      verificationType: {
        type: String,
        enum: ["creator", "artist", "business", "celebrity", "none"],
        default: "none",
      },
    },
    
    // External links
    externalLinks: {
      website: String,
      instagram: String,
      twitter: String,
      tiktok: String,
      youtube: String,
      spotify: String,
      soundcloud: String,
    },
    
    // Account status
    status: {
      type: String,
      enum: ["active", "restricted", "suspended", "deactivated"],
      default: "active",
    },
    
    // Onboarding progress
    onboarding: {
      completed: { type: Boolean, default: false },
      steps: {
        profileSetup: { type: Boolean, default: false },
        interestsSelected: { type: Boolean, default: false },
        firstPost: { type: Boolean, default: false },
        firstFollow: { type: Boolean, default: false },
      },
    },
    
    // Analytics consent
    analyticsConsent: {
      type: Boolean,
      default: true,
    },
    
    // Last seen timestamps per app
    lastSeen: {
      feed: Date,
      gram: Date,
      reel: Date,
      line: Date,
      tv: Date,
      studio: Date,
    },
  },
  {
    timestamps: true,
    collection: "identity_profiles",
  }
);

// Indexes
IdentityProfileSchema.index({ globalHandle: 1 });
IdentityProfileSchema.index({ "verification.isVerified": 1 });
IdentityProfileSchema.index({ status: 1 });

// Static methods
IdentityProfileSchema.statics = {
  /**
   * Get or create identity profile for user
   */
  async ensureForUser(userId) {
    let profile = await this.findOne({ userId });
    if (!profile) {
      profile = await this.create({ userId });
    }
    return profile;
  },
  
  /**
   * Link an app for a user
   */
  async linkApp(userId, appName) {
    const validApps = ["feed", "gram", "reel", "line", "tv", "studio", "coins"];
    if (!validApps.includes(appName)) return null;
    
    return this.findOneAndUpdate(
      { userId },
      { $set: { [`linkedApps.${appName}`]: true } },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Update last seen for an app
   */
  async updateLastSeen(userId, appName) {
    const validApps = ["feed", "gram", "reel", "line", "tv", "studio"];
    if (!validApps.includes(appName)) return null;
    
    return this.findOneAndUpdate(
      { userId },
      { $set: { [`lastSeen.${appName}`]: new Date() } },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Check if handle is available
   */
  async isHandleAvailable(handle) {
    const normalized = handle.toLowerCase().trim();
    const existing = await this.findOne({ globalHandle: normalized });
    return !existing;
  },
  
  /**
   * Set global handle
   */
  async setHandle(userId, handle) {
    const normalized = handle.toLowerCase().trim();
    
    // Validate format
    if (!/^[a-z0-9_]{3,30}$/.test(normalized)) {
      throw new Error("Handle must be 3-30 characters and contain only letters, numbers, and underscores");
    }
    
    // Check availability
    const available = await this.isHandleAvailable(normalized);
    if (!available) {
      throw new Error("Handle is already taken");
    }
    
    return this.findOneAndUpdate(
      { userId },
      { $set: { globalHandle: normalized } },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Update preferences
   */
  async updatePreferences(userId, preferences) {
    const flatUpdates = {};
    
    const flatten = (obj, prefix = "preferences") => {
      for (const [key, value] of Object.entries(obj)) {
        const path = `${prefix}.${key}`;
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          flatten(value, path);
        } else {
          flatUpdates[path] = value;
        }
      }
    };
    
    flatten(preferences);
    
    return this.findOneAndUpdate(
      { userId },
      { $set: flatUpdates },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Complete onboarding step
   */
  async completeOnboardingStep(userId, step) {
    const validSteps = ["profileSetup", "interestsSelected", "firstPost", "firstFollow"];
    if (!validSteps.includes(step)) return null;
    
    const profile = await this.findOneAndUpdate(
      { userId },
      { $set: { [`onboarding.steps.${step}`]: true } },
      { upsert: true, new: true }
    );
    
    // Check if all steps completed
    const steps = profile.onboarding.steps;
    if (steps.profileSetup && steps.interestsSelected && steps.firstPost && steps.firstFollow) {
      profile.onboarding.completed = true;
      await profile.save();
    }
    
    return profile;
  },
  
  /**
   * Get verified users
   */
  async getVerifiedUsers(type = null, limit = 50) {
    const query = { "verification.isVerified": true };
    if (type) {
      query["verification.verificationType"] = type;
    }
    
    return this.find(query)
      .populate("userId", "name avatarUrl")
      .limit(limit)
      .lean();
  },
};

export default mongoose.model("IdentityProfile", IdentityProfileSchema);



