// backend/src/services/users.service.js
// Users service - business logic for user profiles and relationships
import userRepository from "../domain/repositories/user.repository.js";
import relationshipsRepository from "../domain/repositories/relationships.repository.js";
import eventsService from "./events.service.js";
import { logger } from "../config/logger.js";

/**
 * Users service
 * Handles business logic for user profiles, settings, and relationships
 */
const usersService = {
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      return userRepository.getById(userId);
    } catch (error) {
      logger.error("Error getting user:", error);
      throw error;
    }
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      return userRepository.getByEmail(email);
    } catch (error) {
      logger.error("Error getting user by email:", error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    try {
      // Filter allowed updates
      const allowedFields = [
        "name",
        "bio",
        "avatarUrl",
        "coverUrl",
        "location",
        "website",
        "settings",
      ];

      const filteredUpdates = {};
      for (const key of allowedFields) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }

      const user = await userRepository.update(userId, filteredUpdates);

      if (user) {
        logger.info(`Profile updated for user ${userId}`);
      }

      return user;
    } catch (error) {
      logger.error("Error updating profile:", error);
      throw error;
    }
  },

  /**
   * Follow a user
   */
  async followUser(followerId, followingId) {
    try {
      if (followerId.toString() === followingId.toString()) {
        throw new Error("Cannot follow yourself");
      }

      await relationshipsRepository.follow(followerId, followingId);

      // Log event
      await eventsService.logFollow(followerId, followingId)
        .catch(err => logger.warn("Failed to log follow event:", err.message));

      logger.info(`User ${followerId} followed ${followingId}`);

      return { success: true };
    } catch (error) {
      logger.error("Error following user:", error);
      throw error;
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId, followingId) {
    try {
      await relationshipsRepository.unfollow(followerId, followingId);

      logger.info(`User ${followerId} unfollowed ${followingId}`);

      return { success: true };
    } catch (error) {
      logger.error("Error unfollowing user:", error);
      throw error;
    }
  },

  /**
   * Get user's followers
   */
  async getFollowers(userId, options = {}) {
    try {
      return relationshipsRepository.getFollowers(userId, options);
    } catch (error) {
      logger.error("Error getting followers:", error);
      throw error;
    }
  },

  /**
   * Get users that a user follows
   */
  async getFollowing(userId, options = {}) {
    try {
      return relationshipsRepository.getFollowing(userId, options);
    } catch (error) {
      logger.error("Error getting following:", error);
      throw error;
    }
  },

  /**
   * Check if user A follows user B
   */
  async isFollowing(followerId, followingId) {
    try {
      return relationshipsRepository.isFollowing(followerId, followingId);
    } catch (error) {
      logger.error("Error checking follow status:", error);
      throw error;
    }
  },

  /**
   * Block a user
   */
  async blockUser(blockerId, blockedId) {
    try {
      if (blockerId.toString() === blockedId.toString()) {
        throw new Error("Cannot block yourself");
      }

      await relationshipsRepository.block(blockerId, blockedId);

      // Also unfollow each other
      await relationshipsRepository.unfollow(blockerId, blockedId);
      await relationshipsRepository.unfollow(blockedId, blockerId);

      logger.info(`User ${blockerId} blocked ${blockedId}`);

      return { success: true };
    } catch (error) {
      logger.error("Error blocking user:", error);
      throw error;
    }
  },

  /**
   * Unblock a user
   */
  async unblockUser(blockerId, blockedId) {
    try {
      await relationshipsRepository.unblock(blockerId, blockedId);

      logger.info(`User ${blockerId} unblocked ${blockedId}`);

      return { success: true };
    } catch (error) {
      logger.error("Error unblocking user:", error);
      throw error;
    }
  },

  /**
   * Get suggested users to follow
   */
  async getSuggestions(userId, limit = 10) {
    try {
      return userRepository.getSuggestions(userId, limit);
    } catch (error) {
      logger.error("Error getting suggestions:", error);
      throw error;
    }
  },

  /**
   * Search users
   */
  async searchUsers(query, options = {}) {
    try {
      return userRepository.search(query, options);
    } catch (error) {
      logger.error("Error searching users:", error);
      throw error;
    }
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    try {
      const user = await userRepository.getById(userId);
      if (!user) return null;

      const followersCount = await relationshipsRepository.getFollowersCount(userId);
      const followingCount = await relationshipsRepository.getFollowingCount(userId);

      return {
        followersCount,
        followingCount,
        postsCount: user.postsCount || 0,
        coinBalance: user.coinBalance || 0,
      };
    } catch (error) {
      logger.error("Error getting user stats:", error);
      throw error;
    }
  },
};

export default usersService;

