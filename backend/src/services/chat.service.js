// backend/src/services/chat.service.js
// Chat service - business logic for messaging
import chatRepository from "../domain/repositories/chat.repository.js";
import eventsService from "./events.service.js";
import { logger } from "../config/logger.js";
import { EVENT_TYPES, ENTITY_TYPES } from "../domain/models/Event.model.js";

/**
 * Chat service
 * Handles business logic for messaging and conversations
 */
const chatService = {
  /**
   * Send a message
   */
  async sendMessage(senderId, roomId, data) {
    try {
      const messageData = {
        room: roomId,
        sender: senderId,
        type: data.type || "text",
        text: data.text,
        mediaUrl: data.mediaUrl,
        mediaThumbnail: data.mediaThumbnail,
        mediaDuration: data.mediaDuration,
        replyTo: data.replyTo,
        file: data.file,
      };

      const message = await chatRepository.createMessage(messageData);

      // Log event
      await eventsService.logEvent(
        senderId,
        EVENT_TYPES.MESSAGE_SENT,
        ENTITY_TYPES.MESSAGE,
        message._id,
        { roomId, type: data.type }
      );

      logger.debug(`Message sent: ${message._id} in room ${roomId}`);
      return message;
    } catch (error) {
      logger.error("Error sending message:", error);
      throw error;
    }
  },

  /**
   * Get messages for a room
   */
  async getRoomMessages(roomId, options = {}) {
    try {
      return chatRepository.getRoomMessages(roomId, options);
    } catch (error) {
      logger.error("Error getting room messages:", error);
      throw error;
    }
  },

  /**
   * Get user's chat threads (conversations)
   */
  async getChatThreadsForUser(userId, options = {}) {
    try {
      return chatRepository.getChatThreadsForUser(userId, options);
    } catch (error) {
      logger.error("Error getting chat threads:", error);
      throw error;
    }
  },

  /**
   * Mark message as read
   */
  async markMessageRead(messageId, userId) {
    try {
      return chatRepository.markRead(messageId, userId);
    } catch (error) {
      logger.error("Error marking message read:", error);
      throw error;
    }
  },

  /**
   * Mark all messages in a room as read
   */
  async markAllRead(roomId, userId) {
    try {
      return chatRepository.markAllRead(roomId, userId);
    } catch (error) {
      logger.error("Error marking all messages read:", error);
      throw error;
    }
  },

  /**
   * Get unread count for a room
   */
  async getUnreadCount(roomId, userId) {
    try {
      return chatRepository.getUnreadCount(roomId, userId);
    } catch (error) {
      logger.error("Error getting unread count:", error);
      throw error;
    }
  },

  /**
   * Get total unread count for a user
   */
  async getTotalUnreadCount(userId) {
    try {
      return chatRepository.getTotalUnreadCount(userId);
    } catch (error) {
      logger.error("Error getting total unread count:", error);
      throw error;
    }
  },

  /**
   * Delete a message
   */
  async deleteMessage(messageId, userId) {
    try {
      return chatRepository.deleteMessage(messageId, userId);
    } catch (error) {
      logger.error("Error deleting message:", error);
      throw error;
    }
  },

  /**
   * Edit a message
   */
  async editMessage(messageId, userId, newText) {
    try {
      return chatRepository.editMessage(messageId, userId, newText);
    } catch (error) {
      logger.error("Error editing message:", error);
      throw error;
    }
  },

  /**
   * Add reaction to a message
   */
  async addReaction(messageId, userId, emoji) {
    try {
      return chatRepository.addReaction(messageId, userId, emoji);
    } catch (error) {
      logger.error("Error adding reaction:", error);
      throw error;
    }
  },

  /**
   * Remove reaction from a message
   */
  async removeReaction(messageId, userId) {
    try {
      return chatRepository.removeReaction(messageId, userId);
    } catch (error) {
      logger.error("Error removing reaction:", error);
      throw error;
    }
  },

  /**
   * Search messages
   */
  async searchMessages(userId, query, options = {}) {
    try {
      return chatRepository.searchMessages(userId, query, options);
    } catch (error) {
      logger.error("Error searching messages:", error);
      throw error;
    }
  },

  /**
   * Get room statistics
   */
  async getRoomStats(roomId) {
    try {
      return chatRepository.getRoomStats(roomId);
    } catch (error) {
      logger.error("Error getting room stats:", error);
      throw error;
    }
  },

  /**
   * Create or get a direct message room between two users
   * (This would typically involve a ChatRoom model not yet created)
   */
  async getOrCreateDirectRoom(userId1, userId2) {
    // This is a placeholder - would need ChatRoom model
    logger.warn("getOrCreateDirectRoom: ChatRoom model not implemented");
    return {
      id: `dm_${[userId1, userId2].sort().join("_")}`,
      participants: [userId1, userId2],
      type: "direct",
    };
  },

  // ============================================================
  // Controller-compatible method aliases
  // ============================================================

  /**
   * Get user's chat threads (alias for getChatThreadsForUser)
   */
  async getUserChats(userId, options = {}) {
    return this.getChatThreadsForUser(userId, options);
  },

  /**
   * Get chat history for a thread (alias for getRoomMessages)
   */
  async getChatHistory(threadId, options = {}) {
    return this.getRoomMessages(threadId, options);
  },

  /**
   * Mark messages as read (wrapper for markAllRead)
   */
  async markAsRead(threadId, userId, messageIds) {
    if (messageIds && messageIds.length > 0) {
      // Mark specific messages
      for (const msgId of messageIds) {
        await this.markMessageRead(msgId, userId);
      }
      return true;
    }
    // Mark all in thread
    return this.markAllRead(threadId, userId);
  },

  /**
   * Create a new chat thread
   */
  async createThread({ participants, name, isGroup, createdBy }) {
    // Placeholder - would need ChatRoom/Thread model
    logger.warn("createThread: Full ChatRoom model not implemented");
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: threadId,
      participants,
      name: name || null,
      isGroup: isGroup || false,
      createdBy,
      createdAt: new Date(),
    };
  },

  /**
   * Leave a thread
   */
  async leaveThread(threadId, userId) {
    // Placeholder - would need ChatRoom model
    logger.warn("leaveThread: Full ChatRoom model not implemented");
    return true;
  },

  /**
   * Get total unread count for user
   */
  async getUnreadCount(userId) {
    return this.getTotalUnreadCount(userId);
  },
};

export default chatService;

