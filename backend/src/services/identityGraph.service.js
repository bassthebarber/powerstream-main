// backend/src/services/identityGraph.service.js
// Unified Identity Graph (UIG) Service
import IdentityProfile from "../domain/models/IdentityProfile.model.js";
import { logger } from "../config/logger.js";

/**
 * Identity Graph Service
 * Manages unified user identity across all PowerStream apps
 */
const identityGraphService = {
  /**
   * Ensure identity profile exists for a user
   */
  async ensureIdentityProfileForUser(userId) {
    return IdentityProfile.ensureForUser(userId);
  },
  
  /**
   * Link an app for a user
   */
  async linkAppForUser(userId, appName) {
    const result = await IdentityProfile.linkApp(userId, appName);
    if (result) {
      logger.info(`App ${appName} linked for user ${userId}`);
    }
    return result;
  },
  
  /**
   * Get user identity profile
   */
  async getUserIdentityProfile(userId) {
    return IdentityProfile.ensureForUser(userId);
  },
  
  /**
   * Set global handle for user
   */
  async setGlobalHandle(userId, handle) {
    try {
      return await IdentityProfile.setHandle(userId, handle);
    } catch (err) {
      logger.error(`Failed to set handle for user ${userId}:`, err.message);
      throw err;
    }
  },
  
  /**
   * Check if handle is available
   */
  async checkHandleAvailability(handle) {
    return IdentityProfile.isHandleAvailable(handle);
  },
  
  /**
   * Update user preferences
   */
  async updatePreferences(userId, preferences) {
    return IdentityProfile.updatePreferences(userId, preferences);
  },
  
  /**
   * Get user preferences
   */
  async getPreferences(userId) {
    const profile = await IdentityProfile.ensureForUser(userId);
    return profile.preferences;
  },
  
  /**
   * Update last seen for an app
   */
  async recordAppVisit(userId, appName) {
    return IdentityProfile.updateLastSeen(userId, appName);
  },
  
  /**
   * Complete onboarding step
   */
  async completeOnboardingStep(userId, step) {
    return IdentityProfile.completeOnboardingStep(userId, step);
  },
  
  /**
   * Get onboarding status
   */
  async getOnboardingStatus(userId) {
    const profile = await IdentityProfile.ensureForUser(userId);
    return {
      completed: profile.onboarding.completed,
      steps: profile.onboarding.steps,
    };
  },
  
  /**
   * Update user bio
   */
  async updateBio(userId, bio) {
    return IdentityProfile.findOneAndUpdate(
      { userId },
      { $set: { bio } },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Update display name
   */
  async updateDisplayName(userId, displayName) {
    return IdentityProfile.findOneAndUpdate(
      { userId },
      { $set: { displayName } },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Update external links
   */
  async updateExternalLinks(userId, links) {
    const allowedLinks = ["website", "instagram", "twitter", "tiktok", "youtube", "spotify", "soundcloud"];
    const filteredLinks = {};
    
    for (const key of allowedLinks) {
      if (links[key] !== undefined) {
        filteredLinks[`externalLinks.${key}`] = links[key];
      }
    }
    
    return IdentityProfile.findOneAndUpdate(
      { userId },
      { $set: filteredLinks },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Verify a user
   */
  async verifyUser(userId, verificationType) {
    return IdentityProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          "verification.isVerified": true,
          "verification.verifiedAt": new Date(),
          "verification.verificationType": verificationType,
        },
      },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Get verified users
   */
  async getVerifiedUsers(type = null, limit = 50) {
    return IdentityProfile.getVerifiedUsers(type, limit);
  },
  
  /**
   * Get user's linked apps
   */
  async getLinkedApps(userId) {
    const profile = await IdentityProfile.ensureForUser(userId);
    return profile.linkedApps;
  },
  
  /**
   * Update studio profile
   */
  async updateStudioProfile(userId, studioData) {
    const updates = {};
    
    if (studioData.artistName) {
      updates["appProfiles.studio.artistName"] = studioData.artistName;
    }
    if (studioData.recordLabel) {
      updates["appProfiles.studio.recordLabel"] = studioData.recordLabel;
    }
    if (studioData.genres) {
      updates["appProfiles.studio.genres"] = studioData.genres;
    }
    
    return IdentityProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Update TV profile
   */
  async updateTVProfile(userId, tvData) {
    const updates = {};
    
    if (tvData.channelName) {
      updates["appProfiles.tv.channelName"] = tvData.channelName;
    }
    if (tvData.isVerifiedBroadcaster !== undefined) {
      updates["appProfiles.tv.isVerifiedBroadcaster"] = tvData.isVerifiedBroadcaster;
    }
    
    return IdentityProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Get unified profile (combines User + Identity data)
   */
  async getUnifiedProfile(userId) {
    const [identityProfile, User] = await Promise.all([
      IdentityProfile.ensureForUser(userId),
      import("../../models/User.js").then(m => m.default),
    ]);
    
    const user = await User.findById(userId).select("-password").lean();
    
    if (!user) return null;
    
    return {
      // Basic user info
      id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      roles: user.roles,
      coinBalance: user.coinBalance,
      isVerified: user.isVerified,
      
      // Identity profile
      handle: identityProfile.globalHandle,
      displayName: identityProfile.displayName || user.name,
      bio: identityProfile.bio,
      linkedApps: identityProfile.linkedApps,
      preferences: identityProfile.preferences,
      verification: identityProfile.verification,
      externalLinks: identityProfile.externalLinks,
      onboarding: identityProfile.onboarding,
      appProfiles: identityProfile.appProfiles,
      
      // Timestamps
      memberSince: user.createdAt,
      lastSeen: identityProfile.lastSeen,
    };
  },
  
  /**
   * Deactivate account
   */
  async deactivateAccount(userId) {
    return IdentityProfile.findOneAndUpdate(
      { userId },
      { $set: { status: "deactivated" } },
      { new: true }
    );
  },
  
  /**
   * Reactivate account
   */
  async reactivateAccount(userId) {
    return IdentityProfile.findOneAndUpdate(
      { userId },
      { $set: { status: "active" } },
      { new: true }
    );
  },
};

export default identityGraphService;



