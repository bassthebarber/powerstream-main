// backend/src/api/controllers/users.controller.js
// Canonical users controller - handles user profile and social features
import { User, Relationship } from "../../domain/models/index.js";
import userRepository from "../../domain/repositories/user.repository.js";
import relationshipsRepository from "../../domain/repositories/relationships.repository.js";
import eventsService from "../../services/events.service.js";
import { logger } from "../../config/logger.js";

const usersController = {
  /**
   * GET /api/users/profile
   * Get current user's full profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await userRepository.getById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, user });
    } catch (error) {
      logger.error("Error getting profile:", error);
      next(error);
    }
  },

  /**
   * PUT /api/users/profile
   * Update current user's profile
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, bio, avatarUrl, settings } = req.body;

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (bio !== undefined) updates.bio = bio;
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
      if (settings !== undefined) updates.settings = settings;

      const user = await userRepository.update(userId, updates);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, user });
    } catch (error) {
      logger.error("Error updating profile:", error);
      next(error);
    }
  },

  /**
   * GET /api/users/:id
   * Get a user by ID
   */
  async getUser(req, res, next) {
    try {
      const { id } = req.params;
      const viewerId = req.user?.id;

      const user = await userRepository.getById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if viewer follows this user
      let isFollowing = false;
      if (viewerId && viewerId !== id) {
        isFollowing = await relationshipsRepository.isFollowing(viewerId, id);
      }

      res.json({ 
        success: true, 
        user: {
          ...user.toObject ? user.toObject() : user,
          isFollowing,
        }
      });
    } catch (error) {
      logger.error("Error getting user:", error);
      next(error);
    }
  },

  /**
   * POST /api/users/:id/follow
   * Follow a user
   */
  async followUser(req, res, next) {
    try {
      const { id: targetId } = req.params;
      const userId = req.user.id;

      if (userId === targetId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      // Check target exists
      const target = await User.findById(targetId);
      if (!target) {
        return res.status(404).json({ message: "User not found" });
      }

      await relationshipsRepository.follow(userId, targetId);

      // Log event
      await eventsService.logFollow(userId, targetId).catch(err => 
        logger.warn("Failed to log follow event:", err.message)
      );

      res.json({ success: true, following: true });
    } catch (error) {
      logger.error("Error following user:", error);
      next(error);
    }
  },

  /**
   * DELETE /api/users/:id/follow
   * Unfollow a user
   */
  async unfollowUser(req, res, next) {
    try {
      const { id: targetId } = req.params;
      const userId = req.user.id;

      await relationshipsRepository.unfollow(userId, targetId);

      res.json({ success: true, following: false });
    } catch (error) {
      logger.error("Error unfollowing user:", error);
      next(error);
    }
  },

  /**
   * GET /api/users/:id/followers
   * Get a user's followers
   */
  async getFollowers(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);

      const followers = await relationshipsRepository.getFollowers(id, { page, limit });

      res.json({
        success: true,
        followers,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting followers:", error);
      next(error);
    }
  },

  /**
   * GET /api/users/:id/following
   * Get users that a user follows
   */
  async getFollowing(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);

      const following = await relationshipsRepository.getFollowing(id, { page, limit });

      res.json({
        success: true,
        following,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting following:", error);
      next(error);
    }
  },

  /**
   * POST /api/users/:id/block
   * Block a user
   */
  async blockUser(req, res, next) {
    try {
      const { id: targetId } = req.params;
      const userId = req.user.id;

      if (userId === targetId) {
        return res.status(400).json({ message: "Cannot block yourself" });
      }

      await relationshipsRepository.block(userId, targetId);

      res.json({ success: true, blocked: true });
    } catch (error) {
      logger.error("Error blocking user:", error);
      next(error);
    }
  },

  /**
   * DELETE /api/users/:id/block
   * Unblock a user
   */
  async unblockUser(req, res, next) {
    try {
      const { id: targetId } = req.params;
      const userId = req.user.id;

      await relationshipsRepository.unblock(userId, targetId);

      res.json({ success: true, blocked: false });
    } catch (error) {
      logger.error("Error unblocking user:", error);
      next(error);
    }
  },

  /**
   * GET /api/users/suggestions
   * Get suggested users to follow
   */
  async getSuggestions(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit) || 10, 20);

      // Simple suggestion: users not followed, excluding self
      const user = await User.findById(userId);
      const following = await relationshipsRepository.getFollowingIds(userId);
      
      const suggestions = await User.find({
        _id: { $nin: [userId, ...following] },
        status: "active",
      })
        .select("name avatarUrl bio followersCount")
        .sort({ followersCount: -1 })
        .limit(limit);

      res.json({
        success: true,
        suggestions,
      });
    } catch (error) {
      logger.error("Error getting suggestions:", error);
      next(error);
    }
  },

  /**
   * GET /api/users/search
   * Search for users
   */
  async searchUsers(req, res, next) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);

      if (!q) {
        return res.status(400).json({ message: "Search query required" });
      }

      const users = await User.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
        status: "active",
      })
        .select("name avatarUrl bio")
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        success: true,
        users,
        query: q,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error searching users:", error);
      next(error);
    }
  },
};

export default usersController;

