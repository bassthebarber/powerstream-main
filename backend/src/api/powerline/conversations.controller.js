// backend/src/api/powerline/conversations.controller.js
// Conversations Controller - PowerLine V5

import mongoose from "mongoose";
import Conversation from "../../../models/Conversation.js";
import Message from "../../../models/Message.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

/**
 * GET /api/powerline/conversations
 * List all conversations for current user
 */
export async function list(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const page = parseInt(req.query.page ?? "1", 10);
    const limit = Math.min(parseInt(req.query.limit ?? "20", 10), 50);
    const skip = (page - 1) * limit;

    const query = {
      participants: toObjectId(userId),
      isActive: { $ne: false },
    };

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ lastActivityAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants", "name username avatarUrl email")
        .populate("lastMessage")
        .lean(),
      Conversation.countDocuments(query),
    ]);

    const formatted = conversations.map((conv) => {
      const others = (conv.participants || []).filter(
        (p) => String(p._id) !== String(userId)
      );
      const other = others[0] || null;

      return {
        id: conv._id,
        _id: conv._id,
        title: conv.isGroup
          ? conv.title || "Group chat"
          : other?.name || other?.username || "Conversation",
        isGroup: conv.isGroup || false,
        avatarUrl: conv.isGroup ? conv.avatarUrl : other?.avatarUrl || null,
        participants: conv.participants,
        lastMessage: conv.lastMessage || null,
        lastActivityAt: conv.lastActivityAt || conv.updatedAt,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    res.json({
      success: true,
      data: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/powerline/conversations
 * Create a new conversation
 */
export async function create(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    let { participants = [], title, isGroup = false } = req.body;

    // Ensure current user is included
    const userIdStr = String(userId);
    if (!participants.includes(userIdStr)) {
      participants.push(userIdStr);
    }
    participants = [...new Set(participants)].map(toObjectId);

    // For 1:1 DM, check if exists
    if (!isGroup && participants.length === 2) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 },
        isActive: { $ne: false },
      })
        .populate("participants", "name username avatarUrl email")
        .lean();

      if (existing) {
        return res.json({
          success: true,
          data: existing,
          isExisting: true,
        });
      }
    }

    const conversation = await Conversation.create({
      participants,
      title: isGroup ? title || "New group" : null,
      isGroup,
      createdBy: userId,
      lastActivityAt: new Date(),
      isActive: true,
    });

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "name username avatarUrl email")
      .lean();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("conversation:created", { conversationId: populated._id });
    }

    res.status(201).json({
      success: true,
      data: populated,
      isExisting: false,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/powerline/conversations/:id
 * Get conversation by ID
 */
export async function getById(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id)
      .populate("participants", "name username avatarUrl email")
      .lean();

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Verify participant
    const isParticipant = conversation.participants.some(
      (p) => String(p._id) === String(userId)
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/powerline/conversations/:id
 * Update conversation (title, settings)
 */
export async function update(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;
    const { title, settings } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Verify participant
    const isParticipant = conversation.participants.some(
      (p) => String(p) === String(userId)
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (title !== undefined) conversation.title = title;
    if (settings) {
      conversation.settings = { ...conversation.settings, ...settings };
    }
    await conversation.save();

    const populated = await Conversation.findById(id)
      .populate("participants", "name username avatarUrl email")
      .lean();

    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/powerline/conversations/:id
 * Leave/archive conversation
 */
export async function remove(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Remove user from participants (soft leave)
    conversation.participants = conversation.participants.filter(
      (p) => String(p) !== String(userId)
    );

    // If no participants left, mark inactive
    if (conversation.participants.length === 0) {
      conversation.isActive = false;
    }

    await conversation.save();

    res.json({ success: true, message: "Left conversation" });
  } catch (err) {
    next(err);
  }
}

export default { list, create, getById, update, remove };


