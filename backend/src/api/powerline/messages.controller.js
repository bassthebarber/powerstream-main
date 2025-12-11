// backend/src/api/powerline/messages.controller.js
// Messages Controller - PowerLine V5

import mongoose from "mongoose";
import Conversation from "../../../models/Conversation.js";
import Message from "../../../models/Message.js";

/**
 * GET /api/powerline/conversations/:conversationId/messages
 * List messages in a conversation
 */
export async function list(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { conversationId } = req.params;
    const { limit = 50, before, after } = req.query;

    // Verify conversation & participant
    const conversation = await Conversation.findById(conversationId)
      .select("_id participants")
      .lean();

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => String(p) === String(userId)
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Build query
    const query = {
      conversation: conversationId,
      isDeleted: { $ne: true },
    };

    if (before) query.createdAt = { $lt: new Date(before) };
    else if (after) query.createdAt = { $gt: new Date(after) };

    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 100);

    // Use model helper if available
    let messages;
    if (typeof Message.getForConversation === "function") {
      messages = await Message.getForConversation(conversationId, {
        limit: parsedLimit,
        before: before ? new Date(before) : undefined,
        after: after ? new Date(after) : undefined,
      });
    } else {
      messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
        .populate("sender", "name username avatarUrl")
        .populate("replyTo")
        .lean();

      messages = messages.reverse();
    }

    // Format messages
    const formatted = messages.map((msg) => ({
      id: msg._id,
      _id: msg._id,
      conversationId,
      text: msg.text,
      type: msg.type || "text",
      sender: msg.sender,
      fromSelf: String(msg.sender?._id || msg.sender) === String(userId),
      media: msg.media || [],
      reactions: msg.reactions || [],
      replyTo: msg.replyTo || null,
      status: msg.status || "sent",
      isEdited: msg.isEdited || false,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    res.json({
      success: true,
      data: formatted,
      count: formatted.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/powerline/conversations/:conversationId/messages
 * Send a message
 */
export async function send(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { conversationId } = req.params;
    const { text, type = "text", media, replyTo } = req.body;

    if (!text && !media) {
      return res.status(400).json({ success: false, message: "Message text or media required" });
    }

    // Verify conversation & participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => String(p) === String(userId)
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      text: text?.trim() || "",
      type,
      media: media || [],
      replyTo: replyTo || null,
      status: "sent",
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastActivityAt = new Date();
    await conversation.save();

    // Populate for response
    const populated = await Message.findById(message._id)
      .populate("sender", "name username avatarUrl")
      .populate("replyTo")
      .lean();

    const formatted = {
      id: populated._id,
      _id: populated._id,
      conversationId,
      text: populated.text,
      type: populated.type,
      sender: populated.sender,
      fromSelf: true,
      media: populated.media || [],
      replyTo: populated.replyTo,
      status: populated.status,
      createdAt: populated.createdAt,
    };

    // Emit socket events
    const io = req.app.get("io");
    if (io) {
      const room = `conversation:${conversationId}`;
      
      // Main namespace
      io.to(room).emit("message:new", formatted);
      
      // PowerLine namespace
      const powerlineNsp = io.of("/powerline");
      if (powerlineNsp) {
        powerlineNsp.to(room).emit("message:new", formatted);
      }

      // Chat namespace
      const chatNsp = io.of("/chat");
      if (chatNsp) {
        chatNsp.to(`thread:${conversationId}`).emit("message:new", {
          ...formatted,
          threadId: conversationId,
        });
      }

      // Broadcast conversation update
      io.emit("conversation:updated", { conversationId });
    }

    res.status(201).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/powerline/messages/:id
 * Get single message
 */
export async function getById(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const message = await Message.findById(id)
      .populate("sender", "name username avatarUrl")
      .populate("replyTo")
      .lean();

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(message.conversation)
      .select("participants")
      .lean();

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => String(p) === String(userId)
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({
      success: true,
      data: {
        ...message,
        fromSelf: String(message.sender?._id) === String(userId),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/powerline/messages/:id
 * Edit a message
 */
export async function update(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;
    const { text } = req.body;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Only sender can edit
    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Can only edit your own messages" });
    }

    // Use model method if available
    if (typeof message.edit === "function") {
      await message.edit(text);
    } else {
      if (!message.isEdited) {
        message.originalText = message.text;
      }
      message.text = text;
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();
    }

    const populated = await Message.findById(id)
      .populate("sender", "name username avatarUrl")
      .lean();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${message.conversation}`).emit("message:updated", populated);
    }

    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/powerline/messages/:id
 * Delete a message
 */
export async function remove(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Only sender can delete
    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Can only delete your own messages" });
    }

    // Use model method if available
    if (typeof message.softDelete === "function") {
      await message.softDelete(userId);
    } else {
      message.isDeleted = true;
      message.deletedAt = new Date();
      message.deletedBy = userId;
      await message.save();
    }

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${message.conversation}`).emit("message:deleted", { id });
    }

    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/powerline/messages/:id/reactions
 * Add reaction to message
 */
export async function addReaction(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ success: false, message: "Emoji required" });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Use model method if available
    if (typeof message.addReaction === "function") {
      await message.addReaction(userId, emoji);
    } else {
      message.reactions = message.reactions.filter(
        (r) => String(r.user) !== String(userId)
      );
      message.reactions.push({ user: userId, emoji });
      await message.save();
    }

    const populated = await Message.findById(id)
      .populate("sender", "name username avatarUrl")
      .lean();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${message.conversation}`).emit("message:reaction", {
        messageId: id,
        reactions: populated.reactions,
      });
    }

    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/powerline/messages/:id/reactions
 * Remove reaction from message
 */
export async function removeReaction(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Use model method if available
    if (typeof message.removeReaction === "function") {
      await message.removeReaction(userId);
    } else {
      message.reactions = message.reactions.filter(
        (r) => String(r.user) !== String(userId)
      );
      await message.save();
    }

    const populated = await Message.findById(id)
      .populate("sender", "name username avatarUrl")
      .lean();

    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

export default {
  list,
  send,
  getById,
  update,
  remove,
  addReaction,
  removeReaction,
};


