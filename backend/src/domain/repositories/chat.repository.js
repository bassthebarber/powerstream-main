// backend/src/domain/repositories/chat.repository.js
// Chat repository - data access layer for messages and conversations
import Message, { MESSAGE_STATUS } from "../models/Message.model.js";
import mongoose from "mongoose";
import { logger } from "../../config/logger.js";

/**
 * Chat repository
 * Handles all data access for chat messages and conversations
 */
const chatRepository = {
  /**
   * Create a new message
   */
  async createMessage(data) {
    const message = new Message(data);
    await message.save();
    return message.populate("sender", "name username avatarUrl");
  },

  /**
   * Get message by ID
   */
  async getMessageById(messageId) {
    return Message.findById(messageId)
      .populate("sender", "name username avatarUrl")
      .populate("replyTo");
  },

  /**
   * Get messages for a room/conversation
   */
  async getRoomMessages(roomId, options = {}) {
    const { 
      limit = 50, 
      before, // cursor-based pagination
      after,
    } = options;

    const query = { 
      room: roomId, 
      isDeleted: false,
    };

    // Cursor-based pagination
    if (before) {
      query.createdAt = { $lt: before };
    } else if (after) {
      query.createdAt = { $gt: after };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name username avatarUrl")
      .populate("replyTo");

    // Reverse to get chronological order
    return messages.reverse();
  },

  /**
   * Get chat threads for a user
   */
  async getChatThreadsForUser(userId, options = {}) {
    const { limit = 20, skip = 0 } = options;

    // Get unique rooms this user has messages in
    const threads = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { "readBy": new mongoose.Types.ObjectId(userId) },
          ],
          isDeleted: false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$room",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$sender", new mongoose.Types.ObjectId(userId)] },
                    { $not: { $in: [new mongoose.Types.ObjectId(userId), "$readBy"] } },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "chatrooms",
          localField: "_id",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "lastMessage.senderInfo",
        },
      },
      {
        $unwind: {
          path: "$lastMessage.senderInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    return threads;
  },

  /**
   * Mark message as delivered
   */
  async markDelivered(messageId, userId) {
    return Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { deliveredTo: userId },
        $set: { 
          status: MESSAGE_STATUS.DELIVERED,
          deliveredAt: new Date(),
        },
      },
      { new: true }
    );
  },

  /**
   * Mark message as read
   */
  async markRead(messageId, userId) {
    return Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { readBy: userId },
        $set: { 
          status: MESSAGE_STATUS.READ,
          readAt: new Date(),
        },
      },
      { new: true }
    );
  },

  /**
   * Mark all messages as read in a room
   */
  async markAllRead(roomId, userId) {
    return Message.updateMany(
      {
        room: roomId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId },
        $set: { status: MESSAGE_STATUS.READ, readAt: new Date() },
      }
    );
  },

  /**
   * Get unread count for a user in a room
   */
  async getUnreadCount(roomId, userId) {
    return Message.countDocuments({
      room: roomId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
      isDeleted: false,
    });
  },

  /**
   * Get total unread count for a user (across all rooms)
   */
  async getTotalUnreadCount(userId) {
    const result = await Message.aggregate([
      {
        $match: {
          sender: { $ne: new mongoose.Types.ObjectId(userId) },
          readBy: { $ne: new mongoose.Types.ObjectId(userId) },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    return result[0]?.count || 0;
  },

  /**
   * Delete message (soft delete)
   */
  async deleteMessage(messageId, userId) {
    return Message.findOneAndUpdate(
      { _id: messageId, sender: userId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: userId,
        },
      },
      { new: true }
    );
  },

  /**
   * Edit message
   */
  async editMessage(messageId, userId, newText) {
    const message = await Message.findOne({ _id: messageId, sender: userId });
    
    if (!message) {
      return null;
    }

    // Save original text if first edit
    if (!message.isEdited) {
      message.originalText = message.text;
    }

    message.text = newText;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();
    return message.populate("sender", "name username avatarUrl");
  },

  /**
   * Add reaction to message
   */
  async addReaction(messageId, userId, emoji) {
    // Remove existing reaction from this user
    await Message.findByIdAndUpdate(messageId, {
      $pull: { reactions: { userId } },
    });

    // Add new reaction
    return Message.findByIdAndUpdate(
      messageId,
      {
        $push: {
          reactions: {
            userId,
            emoji,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
  },

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId, userId) {
    return Message.findByIdAndUpdate(
      messageId,
      { $pull: { reactions: { userId } } },
      { new: true }
    );
  },

  /**
   * Search messages
   */
  async searchMessages(userId, query, options = {}) {
    const { limit = 20, skip = 0 } = options;

    return Message.find({
      text: { $regex: query, $options: "i" },
      isDeleted: false,
      $or: [
        { sender: userId },
        { readBy: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name username avatarUrl");
  },

  /**
   * Get message statistics for a room
   */
  async getRoomStats(roomId) {
    const result = await Message.aggregate([
      { $match: { room: new mongoose.Types.ObjectId(roomId), isDeleted: false } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          mediaMessages: {
            $sum: { $cond: [{ $in: ["$type", ["image", "video", "audio"]] }, 1, 0] },
          },
          firstMessage: { $min: "$createdAt" },
          lastMessage: { $max: "$createdAt" },
        },
      },
    ]);

    return result[0] || { totalMessages: 0, mediaMessages: 0 };
  },
};

export default chatRepository;



