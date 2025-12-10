// backend/controllers/powerlineController.js
// PowerLine v5 API Controller - Golden Version with Socket.IO

import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const listThreads = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.json({
        success: false,
        data: [],
        message: "User missing in auth middleware"
      });
    }

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'name avatarUrl')
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    const threads = await Promise.all(
      conversations.map(async (conv) => {
        let lastMessage = null;

        try {
          lastMessage = await Message.findOne({
            conversation: conv._id
          })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        } catch (err) {
          console.log("Error loading last message:", err);
        }

        return {
          id: conv._id,
          _id: conv._id,
          title:
            conv.title ||
            conv.participants
              .filter((p) => String(p._id) !== String(userId))
              .map((p) => p.name)
              .join(', ') ||
            'Conversation',
          participants: conv.participants,
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                createdAt: lastMessage.createdAt,
                fromSelf: String(lastMessage.sender) === String(userId)
              }
            : null,
          updatedAt: conv.updatedAt,
          createdAt: conv.createdAt
        };
      })
    );

    return res.json({
      success: true,
      data: threads,
      message: "Threads loaded"
    });
  } catch (err) {
    console.log("PowerLine THREAD ERROR:", err);
    return res.json({
      success: false,
      data: [],
      message: "Internal PowerLine error"
    });
  }
};

export const getThreadMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!id) {
      return res.json({
        success: false,
        data: [],
        message: "Thread ID required"
      });
    }

    const conv = await Conversation.findById(id).lean().exec();
    if (!conv) {
      return res.json({
        success: false,
        data: [],
        message: "Conversation not found"
      });
    }

    const messages = await Message.find({ conversation: id })
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    const mapped = (messages || []).map((m) => ({
      id: m._id,
      _id: m._id,
      text: m.text || '',
      createdAt: m.createdAt,
      fromSelf: userId ? String(m.sender?._id || m.sender) === String(userId) : false,
      sender: m.sender
    }));

    return res.json({
      success: true,
      data: mapped,
      message: "Messages loaded"
    });
  } catch (err) {
    console.log("PowerLine MESSAGES ERROR:", err);
    return res.json({
      success: false,
      data: [],
      message: "Internal PowerLine error"
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user?._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thread ID required"
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text required"
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const conv = await Conversation.findById(id);
    if (!conv) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    const msg = await Message.create({
      conversation: id,
      sender: userId,
      text: text.trim()
    });

    // Update conversation lastMessage
    conv.lastMessage = msg._id;
    conv.updatedAt = new Date();
    await conv.save();

    const savedMessage = {
      id: msg._id,
      _id: msg._id,
      text: msg.text,
      createdAt: msg.createdAt,
      fromSelf: true,
      sender: userId,
      threadId: id,
      conversationId: id
    };

    // Emit socket events if io is available
    const io = req.app?.get?.('io');
    if (io) {
      // Emit to thread room
      io.to(`thread:${id}`).emit('message:new', savedMessage);
      io.of('/powerline').to(`thread:${id}`).emit('message:new', savedMessage);
      
      // Emit thread updated for sidebar
      io.emit('thread:updated', { threadId: id });
      io.of('/powerline').emit('thread:updated', { threadId: id });
    }

    return res.status(201).json({
      success: true,
      data: savedMessage,
      message: "Message sent"
    });
  } catch (err) {
    console.log("PowerLine SEND ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
};

export const createThread = async (req, res) => {
  try {
    // Support multiple body shapes:
    // { participantIds, title, isGroup }
    // { participants, title, type }
    const { participantIds, participants, title, isGroup, type } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Get participant list from either field
    let participantList = participantIds || participants || [];
    if (!Array.isArray(participantList)) {
      participantList = [];
    }

    // Add current user to participants if not already included
    const allParticipants = [...new Set([String(userId), ...participantList.map(String)])];

    // Determine if it's a group chat
    const isGroupChat = isGroup || type === 'group' || allParticipants.length > 2;

    // For 1:1 DM, check if conversation already exists
    if (allParticipants.length === 2 && !isGroupChat) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: allParticipants, $size: 2 },
        isActive: { $ne: false }
      }).populate('participants', 'name avatarUrl');

      if (existing) {
        const thread = {
          id: existing._id,
          _id: existing._id,
          title: existing.title || existing.participants
            .filter((p) => String(p._id) !== String(userId))
            .map((p) => p.name)
            .join(', ') || 'Conversation',
          participants: existing.participants,
          lastMessage: null,
          updatedAt: existing.updatedAt,
          createdAt: existing.createdAt
        };
        
        return res.json({
          success: true,
          data: thread,
          message: "Existing conversation found"
        });
      }
    }

    // Create new conversation
    const conv = await Conversation.create({
      participants: allParticipants,
      title: title || null,
      isGroup: isGroupChat,
      createdBy: userId
    });

    // Populate for response
    const populated = await Conversation.findById(conv._id)
      .populate('participants', 'name avatarUrl')
      .lean();

    const thread = {
      id: populated._id,
      _id: populated._id,
      title: populated.title || populated.participants
        .filter((p) => String(p._id) !== String(userId))
        .map((p) => p.name)
        .join(', ') || 'Conversation',
      participants: populated.participants,
      lastMessage: null,
      updatedAt: populated.updatedAt,
      createdAt: populated.createdAt
    };

    // Emit socket event for new thread
    const io = req.app?.get?.('io');
    if (io) {
      io.emit('thread:new', thread);
      io.of('/powerline').emit('thread:new', thread);
    }

    return res.status(201).json({
      success: true,
      data: thread,
      message: "Conversation created"
    });
  } catch (err) {
    console.log("PowerLine CREATE THREAD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create conversation"
    });
  }
};

export default {
  listThreads,
  getThreadMessages,
  sendMessage,
  createThread
};
