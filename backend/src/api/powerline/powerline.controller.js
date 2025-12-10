// backend/src/api/powerline/powerline.controller.js
// PowerLine V5 controller – Facebook Messenger–style backend

import mongoose from "mongoose";
import Conversation from "../../../models/Conversation.js";
import Message from "../../../models/Message.js";

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

/**
 * GET /api/powerline/chats
 * List conversations for the current user
 */
export async function listUserChats(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const page = parseInt(req.query.page ?? "1", 10);
    const limit = Math.min(parseInt(req.query.limit ?? "20", 10), 50);
    const skip = (page - 1) * limit;

    const query = {
      participants: toObjectId(userId),
      isActive: { $ne: false },
    };

    const [items, total] = await Promise.all([
      Conversation.find(query)
        .sort({ lastActivityAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants", "name username avatarUrl email")
        .populate("lastMessage")
        .lean(),
      Conversation.countDocuments(query),
    ]);

    const threads = items.map((conv) => {
      const others = (conv.participants || []).filter(
        (p) => String(p._id) !== String(userId)
      );

      const other = others[0] || null;

      return {
        id: conv._id,
        title: conv.isGroup
          ? conv.title || "Group chat"
          : other?.name || other?.username || "Conversation",
        isGroup: conv.isGroup,
        avatarUrl: conv.isGroup ? conv.avatarUrl : other?.avatarUrl || null,
        participants: conv.participants,
        lastMessage: conv.lastMessage || null,
        lastActivityAt: conv.lastActivityAt || conv.updatedAt,
      };
    });

    res.json({
      success: true,
      threads,
      page,
      limit,
      total,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/powerline/chats
 * body: { participants: [userId...], title?, isGroup? }
 */
export async function createChat(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    let { participants = [], title, isGroup = false } = req.body;

    // Ensure current user is in participants
    const userIdStr = String(userId);
    if (!participants.includes(userIdStr)) {
      participants.push(userIdStr);
    }
    participants = [...new Set(participants)].map(toObjectId);

    // For 1:1 chats, reuse if already exists
    if (!isGroup && participants.length === 2) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 },
        isActive: { $ne: false },
      })
        .populate("participants", "name username avatarUrl email")
        .lean();

      if (existing) {
        return res.status(200).json({
          success: true,
          chat: existing,
          reused: true,
        });
      }
    }

    const convo = await Conversation.create({
      participants,
      title: isGroup ? title || "New group" : null,
      isGroup,
      avatarUrl: null,
      createdBy: userId,
      lastMessage: null,
      lastActivityAt: new Date(),
      isActive: true,
      settings: {
        muteNotifications: false,
        pinned: false,
      },
    });

    const populated = await Conversation.findById(convo._id)
      .populate("participants", "name username avatarUrl email")
      .lean();

    res.status(201).json({
      success: true,
      chat: populated,
      reused: false,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/powerline/chats/:chatId
 */
export async function getChatById(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { chatId } = req.params;

    const convo = await Conversation.findById(chatId)
      .populate("participants", "name username avatarUrl email")
      .lean();

    if (!convo) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Optional: ensure user is a participant
    if (
      userId &&
      !convo.participants.some((p) => String(p._id) === String(userId))
    ) {
      return res.status(403).json({ message: "Not a participant in this chat" });
    }

    res.json({ success: true, chat: convo });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/powerline/chats/:chatId/messages
 */
export async function listMessages(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { chatId } = req.params;
    const { limit = 50, before, after } = req.query;

    // Confirm conversation exists & user belongs
    const convo = await Conversation.findById(chatId)
      .select("_id participants")
      .lean();
    if (!convo) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (
      userId &&
      !convo.participants.some((p) => String(p) === String(userId))
    ) {
      return res.status(403).json({ message: "Not a participant in this chat" });
    }

    const opts = {
      limit: Math.min(parseInt(limit, 10) || 50, 100),
    };
    if (before) opts.before = new Date(before);
    if (after) opts.after = new Date(after);

    // Use helper if defined on Message model
    let messages;
    if (typeof Message.getForConversation === "function") {
      messages = await Message.getForConversation(chatId, opts);
    } else {
      const query = {
        conversation: chatId,
        isDeleted: { $ne: true },
      };
      if (opts.before) query.createdAt = { $lt: opts.before };
      if (opts.after) query.createdAt = { $gt: opts.after };

      messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(opts.limit)
        .populate("sender", "name username avatarUrl")
        .lean();

      messages = messages.reverse();
    }

    res.json({
      success: true,
      messages,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/powerline/chats/:chatId/messages
 * body: { text, type?, media?, file?, replyTo? }
 */
export async function sendMessage(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { chatId } = req.params;
    const { text, type, media, file, replyTo } = req.body;

    if (!text && !media && !file) {
      return res
        .status(400)
        .json({ message: "Message text or media is required" });
    }

    const convo = await Conversation.findById(chatId);
    if (!convo) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Create message
    const message = await Message.create({
      conversation: convo._id,
      room: convo._id, // keep compatibility with existing schema
      sender: userId,
      type: type || "text",
      text: text || "",
      media,
      file,
      replyTo: replyTo || null,
      status: "sent",
    });

    // Update conversation last activity
    convo.lastActivityAt = new Date();
    convo.lastMessage = message._id;
    await convo.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name username avatarUrl")
      .lean();

    // Emit via Socket.io if available
    const io = req.app.get("io");
    if (io) {
      const nsp = io.of("/chat");
      const room = `thread:${convo._id.toString()}`;
      nsp.to(room).emit("message:new", {
        ...populatedMessage,
        conversationId: convo._id,
      });
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (err) {
    next(err);
  }
}
