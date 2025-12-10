// backend/src/api/controllers/chat.controller.js
// Canonical chat controller - handles messaging (PowerLine)
import chatService from "../../services/chat.service.js";
import { logger } from "../../config/logger.js";

const chatController = {
  /**
   * GET /api/chat/threads
   * Get user's chat threads/conversations
   */
  async getThreads(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);

      const threads = await chatService.getUserChats(userId, { page, limit });

      res.json({
        success: true,
        threads,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting chat threads:", error);
      next(error);
    }
  },

  /**
   * GET /api/chat/threads/:threadId
   * Get messages in a thread
   */
  async getMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const { threadId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const before = req.query.before; // cursor for pagination

      const messages = await chatService.getChatHistory(threadId, { page, limit, before });

      res.json({
        success: true,
        messages,
        threadId,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting messages:", error);
      next(error);
    }
  },

  /**
   * POST /api/chat/threads/:threadId/messages
   * Send a message
   */
  async sendMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { threadId } = req.params;
      const { text, type, media, replyTo } = req.body;

      if (!text && !media) {
        return res.status(400).json({ message: "Message must have text or media" });
      }

      const message = await chatService.sendMessage(threadId, userId, {
        text,
        type: type || "text",
        media,
        replyTo,
      });

      res.status(201).json({
        success: true,
        message,
      });
    } catch (error) {
      logger.error("Error sending message:", error);
      next(error);
    }
  },

  /**
   * POST /api/chat/threads
   * Create a new thread/conversation
   */
  async createThread(req, res, next) {
    try {
      const userId = req.user.id;
      const { participantIds, name, isGroup } = req.body;

      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ message: "At least one participant required" });
      }

      // Add creator to participants
      const allParticipants = [userId, ...participantIds.filter(id => id !== userId)];

      const thread = await chatService.createThread({
        participants: allParticipants,
        name,
        isGroup: isGroup || allParticipants.length > 2,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        thread,
      });
    } catch (error) {
      logger.error("Error creating thread:", error);
      next(error);
    }
  },

  /**
   * POST /api/chat/threads/:threadId/read
   * Mark messages as read
   */
  async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { threadId } = req.params;
      const { messageIds } = req.body;

      await chatService.markAsRead(threadId, userId, messageIds);

      res.json({ success: true });
    } catch (error) {
      logger.error("Error marking as read:", error);
      next(error);
    }
  },

  /**
   * DELETE /api/chat/threads/:threadId
   * Leave/delete a thread
   */
  async deleteThread(req, res, next) {
    try {
      const userId = req.user.id;
      const { threadId } = req.params;

      await chatService.leaveThread(threadId, userId);

      res.json({ success: true, message: "Left conversation" });
    } catch (error) {
      logger.error("Error leaving thread:", error);
      next(error);
    }
  },

  /**
   * GET /api/chat/unread
   * Get unread message count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;

      const count = await chatService.getUnreadCount(userId);

      res.json({
        success: true,
        unreadCount: count,
      });
    } catch (error) {
      logger.error("Error getting unread count:", error);
      next(error);
    }
  },
};

export default chatController;



