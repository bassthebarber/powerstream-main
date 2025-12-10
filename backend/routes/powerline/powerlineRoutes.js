// backend/routes/powerline/powerlineRoutes.js
// PowerLine REST API - Complete Implementation

import { Router } from 'express';
import { requireAuth, authOptional } from '../../middleware/authMiddleware.js';
import Conversation from '../../models/Conversation.js';
import Message from '../../models/Message.js';

const router = Router();

// ============================================
// CHATS (Conversations)
// ============================================

/**
 * GET /api/powerline/chats
 * Return all chats for the authenticated user
 */
router.get('/chats', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Conversation.find({
      participants: userId,
      isActive: { $ne: false }
    })
      .populate('participants', 'name avatarUrl email')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean();

    // Format response
    const formattedChats = await Promise.all(chats.map(async (chat) => {
      // Get last message for preview
      let lastMessage = null;
      try {
        lastMessage = await Message.findOne({ conversation: chat._id })
          .sort({ createdAt: -1 })
          .lean();
      } catch (e) {
        console.log('Error fetching last message:', e);
      }

      // Calculate title for DM chats
      const otherParticipants = chat.participants.filter(
        p => String(p._id) !== String(userId)
      );
      const defaultTitle = chat.isGroup
        ? `Group (${chat.participants.length})`
        : otherParticipants.map(p => p.name).join(', ') || 'Chat';

      return {
        id: chat._id,
        _id: chat._id,
        chatId: chat._id,
        title: chat.title || defaultTitle,
        participants: chat.participants,
        isGroup: chat.isGroup || false,
        lastMessage: lastMessage ? {
          id: lastMessage._id,
          text: lastMessage.text,
          sender: lastMessage.sender,
          createdAt: lastMessage.createdAt
        } : null,
        unreadCount: 0, // TODO: implement unread tracking
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
    }));

    return res.json({
      success: true,
      data: formattedChats,
      count: formattedChats.length
    });
  } catch (err) {
    console.error('[PowerLine] GET /chats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: err.message
    });
  }
});

/**
 * POST /api/powerline/chats
 * Create a new chat
 * Body: { participants: [userId], title?: string, isGroup?: boolean }
 */
router.post('/chats', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { participants = [], title, isGroup } = req.body;

    // Ensure current user is included
    const allParticipants = [...new Set([String(userId), ...participants.map(String)])];

    // Validate at least 2 participants for a chat
    if (allParticipants.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'At least one participant required'
      });
    }

    // For 1:1 DM, check if chat already exists
    if (allParticipants.length === 2 && !isGroup) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: allParticipants, $size: 2 },
        isActive: { $ne: false }
      }).populate('participants', 'name avatarUrl email');

      if (existing) {
        return res.json({
          success: true,
          data: {
            id: existing._id,
            _id: existing._id,
            chatId: existing._id,
            title: existing.title,
            participants: existing.participants,
            isGroup: false,
            isExisting: true
          },
          message: 'Existing chat found'
        });
      }
    }

    // Create new chat
    const chat = await Conversation.create({
      participants: allParticipants,
      title: title || null,
      isGroup: isGroup || allParticipants.length > 2,
      createdBy: userId
    });

    const populated = await Conversation.findById(chat._id)
      .populate('participants', 'name avatarUrl email')
      .lean();

    return res.status(201).json({
      success: true,
      data: {
        id: populated._id,
        _id: populated._id,
        chatId: populated._id,
        title: populated.title,
        participants: populated.participants,
        isGroup: populated.isGroup,
        createdAt: populated.createdAt
      },
      message: 'Chat created'
    });
  } catch (err) {
    console.error('[PowerLine] POST /chats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: err.message
    });
  }
});

/**
 * GET /api/powerline/chats/:chatId
 * Return chat details
 */
router.get('/chats/:chatId', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    const chat = await Conversation.findById(chatId)
      .populate('participants', 'name avatarUrl email')
      .lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is participant
    const isParticipant = chat.participants.some(
      p => String(p._id) === String(userId)
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    return res.json({
      success: true,
      data: {
        id: chat._id,
        _id: chat._id,
        chatId: chat._id,
        title: chat.title,
        participants: chat.participants,
        isGroup: chat.isGroup,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });
  } catch (err) {
    console.error('[PowerLine] GET /chats/:chatId error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: err.message
    });
  }
});

// ============================================
// MESSAGES
// ============================================

/**
 * GET /api/powerline/messages/:chatId
 * Return messages for a chat
 */
router.get('/messages/:chatId', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { limit = 50, before, after } = req.query;

    // Verify chat exists and user is participant
    const chat = await Conversation.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(
      p => String(p) === String(userId)
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Build query
    const query = {
      conversation: chatId,
      isDeleted: { $ne: true }
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    } else if (after) {
      query.createdAt = { $gt: new Date(after) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .lean();

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      _id: msg._id,
      chatId: chatId,
      text: msg.text,
      sender: msg.sender,
      fromSelf: String(msg.sender?._id || msg.sender) === String(userId),
      type: msg.type || 'text',
      media: msg.media || [],
      reactions: msg.reactions || [],
      createdAt: msg.createdAt,
      isEdited: msg.isEdited || false
    }));

    return res.json({
      success: true,
      data: formattedMessages,
      count: formattedMessages.length
    });
  } catch (err) {
    console.error('[PowerLine] GET /messages/:chatId error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: err.message
    });
  }
});

/**
 * POST /api/powerline/messages/:chatId
 * Send a message to a chat
 * Body: { text: string, type?: string, media?: array }
 */
router.post('/messages/:chatId', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { text, type = 'text', media = [] } = req.body;

    // Validate
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    // Verify chat exists and user is participant
    const chat = await Conversation.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(
      p => String(p) === String(userId)
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create message
    const message = await Message.create({
      conversation: chatId,
      sender: userId,
      text: text.trim(),
      type,
      media
    });

    // Update conversation
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Populate sender for response
    await message.populate('sender', 'name avatarUrl');

    const formattedMessage = {
      id: message._id,
      _id: message._id,
      chatId: chatId,
      text: message.text,
      sender: message.sender,
      fromSelf: true,
      type: message.type,
      media: message.media,
      createdAt: message.createdAt
    };

    // Emit socket event if io is available
    const io = req.app?.get?.('io');
    if (io) {
      // Emit to chat room
      io.to(`thread:${chatId}`).emit('message:new', {
        ...formattedMessage,
        threadId: chatId
      });
      io.of('/powerline').to(`thread:${chatId}`).emit('message:new', {
        ...formattedMessage,
        threadId: chatId
      });
      
      // Emit chat updated
      io.emit('thread:updated', { threadId: chatId, chatId });
      io.of('/powerline').emit('thread:updated', { threadId: chatId, chatId });
    }

    return res.status(201).json({
      success: true,
      data: formattedMessage,
      message: 'Message sent'
    });
  } catch (err) {
    console.error('[PowerLine] POST /messages/:chatId error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: err.message
    });
  }
});

// ============================================
// THREADS ALIASES (backwards compatibility)
// ============================================

// GET /api/powerline/threads - Return all chats/threads
router.get('/threads', authOptional, async (req, res) => {
  try {
    // Return empty array if not authenticated
    if (!req.user?._id) {
      return res.json({
        success: true,
        ok: true,
        threads: [],
        data: [],
        count: 0,
        message: "Login required to view threads"
      });
    }
    
    const userId = req.user._id;

    const chats = await Conversation.find({
      participants: userId,
      isActive: { $ne: false }
    })
      .populate('participants', 'name avatarUrl email')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean();

    const formattedThreads = await Promise.all(chats.map(async (chat) => {
      let lastMessage = null;
      try {
        lastMessage = await Message.findOne({ conversation: chat._id })
          .sort({ createdAt: -1 })
          .lean();
      } catch (e) {}

      const otherParticipants = chat.participants.filter(
        p => String(p._id) !== String(userId)
      );
      const defaultTitle = chat.isGroup
        ? `Group (${chat.participants.length})`
        : otherParticipants.map(p => p.name).join(', ') || 'Chat';

      return {
        id: chat._id,
        _id: chat._id,
        threadId: chat._id,
        title: chat.title || defaultTitle,
        participants: chat.participants,
        isGroup: chat.isGroup || false,
        lastMessage: lastMessage ? {
          id: lastMessage._id,
          text: lastMessage.text,
          sender: lastMessage.sender,
          createdAt: lastMessage.createdAt
        } : null,
        unreadCount: 0,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
    }));

    return res.json({
      success: true,
      ok: true,
      threads: formattedThreads,
      data: formattedThreads,
      count: formattedThreads.length
    });
  } catch (err) {
    console.error('[PowerLine] GET /threads error:', err);
    return res.status(500).json({
      success: false,
      ok: false,
      message: 'Failed to fetch threads',
      error: err.message
    });
  }
});

// POST /api/powerline/threads - Create new thread
router.post('/threads', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { participants = [], title, isGroup } = req.body;

    const allParticipants = [...new Set([String(userId), ...participants.map(String)])];

    if (allParticipants.length < 1) {
      return res.status(400).json({ success: false, message: 'At least one participant required' });
    }

    if (allParticipants.length === 2 && !isGroup) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: allParticipants, $size: 2 },
        isActive: { $ne: false }
      }).populate('participants', 'name avatarUrl email');

      if (existing) {
        return res.json({
          success: true,
          ok: true,
          data: { id: existing._id, threadId: existing._id, participants: existing.participants, isExisting: true }
        });
      }
    }

    const chat = await Conversation.create({
      participants: allParticipants,
      title: title || null,
      isGroup: isGroup || allParticipants.length > 2,
      createdBy: userId
    });

    const populated = await Conversation.findById(chat._id)
      .populate('participants', 'name avatarUrl email')
      .lean();

    return res.status(201).json({
      success: true,
      ok: true,
      data: { id: populated._id, threadId: populated._id, participants: populated.participants }
    });
  } catch (err) {
    console.error('[PowerLine] POST /threads error:', err);
    return res.status(500).json({ success: false, ok: false, message: 'Failed to create thread' });
  }
});

// GET /api/powerline/threads/:id/messages
router.get('/threads/:id/messages', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const chatId = req.params.id;
    const { limit = 50 } = req.query;

    const chat = await Conversation.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    const isParticipant = chat.participants.some(p => String(p) === String(userId));
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ conversation: chatId, isDeleted: { $ne: true } })
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .lean();

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      threadId: chatId,
      text: msg.text,
      sender: msg.sender,
      fromSelf: String(msg.sender?._id || msg.sender) === String(userId),
      createdAt: msg.createdAt
    }));

    return res.json({ success: true, ok: true, messages: formattedMessages, data: formattedMessages });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// POST /api/powerline/threads/:id/messages
router.post('/threads/:id/messages', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const chatId = req.params.id;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Message text required' });
    }

    const chat = await Conversation.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    const isParticipant = chat.participants.some(p => String(p) === String(userId));
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const message = await Message.create({ conversation: chatId, sender: userId, text: text.trim() });
    chat.lastMessage = message._id;
    await chat.save();
    await message.populate('sender', 'name avatarUrl');

    const io = req.app?.get?.('io');
    if (io) {
      io.to(`thread:${chatId}`).emit('message:new', { id: message._id, threadId: chatId, text: message.text, sender: message.sender });
    }

    return res.status(201).json({ success: true, ok: true, data: { id: message._id, text: message.text } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// ============================================
// NESTED ROUTES (chats/:chatId/messages)
// ============================================

/**
 * GET /api/powerline/chats/:chatId/messages
 * Alias for /messages/:chatId
 */
router.get('/chats/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { limit = 50, before, after } = req.query;

    const chat = await Conversation.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(p => String(p) === String(userId));
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const query = { conversation: chatId, isDeleted: { $ne: true } };
    if (before) query.createdAt = { $lt: new Date(before) };
    else if (after) query.createdAt = { $gt: new Date(after) };

    const messages = await Message.find(query)
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .lean();

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      _id: msg._id,
      chatId,
      text: msg.text,
      sender: msg.sender,
      fromSelf: String(msg.sender?._id || msg.sender) === String(userId),
      type: msg.type || 'text',
      media: msg.media || [],
      reactions: msg.reactions || [],
      createdAt: msg.createdAt,
      isEdited: msg.isEdited || false
    }));

    return res.json({ success: true, ok: true, data: formattedMessages, messages: formattedMessages, count: formattedMessages.length });
  } catch (err) {
    console.error('[PowerLine] GET /chats/:chatId/messages error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

/**
 * POST /api/powerline/chats/:chatId/messages
 * Alias for POST /messages/:chatId
 */
router.post('/chats/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { text, type = 'text', media = [] } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Message text required' });
    }

    const chat = await Conversation.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(p => String(p) === String(userId));
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const message = await Message.create({
      conversation: chatId,
      sender: userId,
      text: text.trim(),
      type,
      media
    });

    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    await message.populate('sender', 'name avatarUrl');

    const formatted = {
      id: message._id,
      _id: message._id,
      chatId,
      text: message.text,
      sender: message.sender,
      fromSelf: true,
      type: message.type,
      media: message.media,
      createdAt: message.createdAt
    };

    const io = req.app?.get?.('io');
    if (io) {
      io.to(`thread:${chatId}`).emit('message:new', { ...formatted, threadId: chatId });
      io.of('/powerline').to(`thread:${chatId}`).emit('message:new', { ...formatted, threadId: chatId });
    }

    return res.status(201).json({ success: true, ok: true, data: formatted, message: formatted });
  } catch (err) {
    console.error('[PowerLine] POST /chats/:chatId/messages error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PowerLine API is running',
    version: 'v5.2',
    endpoints: [
      'GET /api/powerline/chats',
      'POST /api/powerline/chats',
      'GET /api/powerline/chats/:chatId',
      'GET /api/powerline/chats/:chatId/messages',
      'POST /api/powerline/chats/:chatId/messages',
      'GET /api/powerline/messages/:chatId',
      'POST /api/powerline/messages/:chatId',
      'GET /api/powerline/threads'
    ]
  });
});

export default router;


