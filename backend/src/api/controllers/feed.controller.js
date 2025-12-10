// backend/src/api/controllers/feed.controller.js
// Canonical feed controller - handles posts, feed, gram, reel
import feedService from "../../services/feed.service.js";
import eventsService from "../../services/events.service.js";
import { logger } from "../../config/logger.js";

const feedController = {
  /**
   * GET /api/feed
   * Get user's feed (paginated)
   */
  async getFeed(req, res, next) {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const skip = (page - 1) * limit;
      const channel = req.query.channel || "feed";

      const options = { page, limit, skip, channel };

      const feed = await feedService.getFeed(userId, options);

      res.json({
        success: true,
        posts: feed.posts || feed,
        page,
        limit,
        total: feed.total || (feed.posts?.length || feed.length),
      });
    } catch (error) {
      logger.error("Error getting feed:", error);
      next(error);
    }
  },

  /**
   * POST /api/feed
   * Create a new post
   */
  async createPost(req, res, next) {
    try {
      const userId = req.user.id;
      const { text, caption, mediaUrl, mediaType, channel, visibility } = req.body;

      if (!text && !mediaUrl) {
        return res.status(400).json({ message: "Post must have text or media" });
      }

      const post = await feedService.createPost(userId, {
        text,
        caption,
        mediaUrl,
        mediaType,
        channel: channel || "feed",
        visibility: visibility || "public",
      });

      res.status(201).json({
        success: true,
        post,
      });
    } catch (error) {
      logger.error("Error creating post:", error);
      next(error);
    }
  },

  /**
   * GET /api/feed/:id
   * Get a single post by ID
   */
  async getPost(req, res, next) {
    try {
      const { id } = req.params;
      const viewerId = req.user?.id;

      const post = await feedService.getPostById(id, viewerId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json({ success: true, post });
    } catch (error) {
      logger.error("Error getting post:", error);
      next(error);
    }
  },

  /**
   * PUT /api/feed/:id
   * Update a post
   */
  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const post = await feedService.updatePost(id, userId, updates);

      if (!post) {
        return res.status(404).json({ message: "Post not found or unauthorized" });
      }

      res.json({ success: true, post });
    } catch (error) {
      logger.error("Error updating post:", error);
      next(error);
    }
  },

  /**
   * DELETE /api/feed/:id
   * Delete a post
   */
  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await feedService.deletePost(id, userId);

      if (!result) {
        return res.status(404).json({ message: "Post not found or unauthorized" });
      }

      res.json({ success: true, message: "Post deleted" });
    } catch (error) {
      logger.error("Error deleting post:", error);
      next(error);
    }
  },

  /**
   * POST /api/feed/:id/like
   * Like/unlike a post (toggle)
   */
  async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { unlike } = req.body;

      if (unlike) {
        await feedService.unlikePost(id, userId);
      } else {
        await feedService.likePost(id, userId);
      }

      res.json({ success: true, liked: !unlike });
    } catch (error) {
      logger.error("Error toggling like:", error);
      next(error);
    }
  },

  /**
   * POST /api/feed/:id/share
   * Record a share
   */
  async sharePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await feedService.sharePost(id, userId);

      res.json({ success: true, message: "Share recorded" });
    } catch (error) {
      logger.error("Error sharing post:", error);
      next(error);
    }
  },

  /**
   * GET /api/feed/explore
   * Get explore/trending feed
   */
  async getExplore(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);

      const feed = await feedService.getExploreFeed({ page, limit });

      res.json({
        success: true,
        posts: feed.posts || feed,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting explore feed:", error);
      next(error);
    }
  },

  /**
   * GET /api/feed/user/:userId
   * Get posts by a specific user
   */
  async getUserPosts(req, res, next) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);

      const posts = await feedService.getUserPosts(userId, { page, limit });

      res.json({
        success: true,
        posts: posts.posts || posts,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting user posts:", error);
      next(error);
    }
  },

  /**
   * GET /api/feed/hashtag/:tag
   * Get posts by hashtag
   */
  async getPostsByHashtag(req, res, next) {
    try {
      const { tag } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);

      const posts = await feedService.getPostsByHashtag(tag, { page, limit });

      res.json({
        success: true,
        posts,
        hashtag: tag,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting posts by hashtag:", error);
      next(error);
    }
  },

  /**
   * GET /api/feed/trending
   * Get trending hashtags
   */
  async getTrending(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);

      const hashtags = await feedService.getTrendingHashtags(24, limit);

      res.json({
        success: true,
        hashtags,
      });
    } catch (error) {
      logger.error("Error getting trending:", error);
      next(error);
    }
  },

  /**
   * GET /api/feed/search
   * Search posts
   */
  async searchPosts(req, res, next) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);

      if (!q) {
        return res.status(400).json({ message: "Search query required" });
      }

      const posts = await feedService.searchPosts(q, { page, limit });

      res.json({
        success: true,
        posts,
        query: q,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error searching posts:", error);
      next(error);
    }
  },
};

export default feedController;




