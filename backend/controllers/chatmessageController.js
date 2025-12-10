// backend/controllers/chatmessageController.js
import Chat from "../models/ChatModel.js";
import ChatMessage from "../models/ChatMessageModel.js";

/**
 * List messages in a chat
 * GET /api/chat/:chatId/messages?limit=&cursor=
 * Also supports /api/powerline/messages/:conversationId
 */
export async function listMessages(req, res, next) {
  try {
    // Support both param names for flexibility
    const chatId = req.params.chatId || req.params.conversationId;
    const { limit = 50, cursor } = req.query;

    const q = { chat: chatId };
    if (cursor) q._id = { $lt: cursor };

    const items = await ChatMessage.find(q)
      .sort({ createdAt: -1, _id: -1 })
      .limit(Number(limit))
      .populate("author", "name displayName avatarUrl")
      .lean();

    // Transform to add authorName for frontend convenience
    const transformedItems = items.map((msg) => ({
      ...msg,
      authorName: msg.author?.displayName || msg.author?.name || "User",
      user: msg.author, // Include full user object for avatar
    }));

    const nextCursor = items.length ? items[items.length - 1]._id : null;
    res.json({ items: transformedItems, nextCursor });
  } catch (err) { next(err); }
}

/**
 * Send message
 * POST /api/chat/:chatId/messages
 * Also supports /api/powerline/messages/:conversationId
 * body: { author, text, mediaIds? }
 */
export async function sendMessage(req, res, next) {
  try {
    // Support both param names for flexibility
    const chatId = req.params.chatId || req.params.conversationId;
    const { author, text, mediaIds = [] } = req.body;
    if (!author || (!text && mediaIds.length === 0)) {
      return res.status(400).json({ message: "author and text or mediaIds required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const doc = await ChatMessage.create({
      chat: chatId,
      author,
      text,
      media: mediaIds,
    });

    // Update chat last activity
    chat.lastMessageAt = new Date();
    await chat.save();

    // Emit over socket if available
    const io = req.app.get("io");
    if (io) {
      const chatNamespace = io.of("/chat");
      const room = `chat:${chatId}`;
      chatNamespace.to(room).emit("chat:message", {
        ...doc.toObject(),
        authorName: req.user?.name || "Guest",
      });
    }

    res.status(201).json(doc);
  } catch (err) { next(err); }
}

/**
 * Delete message
 * DELETE /api/chat/:chatId/messages/:messageId
 */
export async function deleteMessage(req, res, next) {
  try {
    const { messageId } = req.params;
    const deleted = await ChatMessage.findByIdAndDelete(messageId);
    if (!deleted) return res.status(404).json({ message: "Message not found" });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

/**
 * Add or toggle reaction on a message
 * POST /api/chat/:chatId/messages/:messageId/reactions
 * body: { type: 'like' | 'love' | 'fire' }
 */
export async function addReaction(req, res, next) {
  try {
    const { messageId } = req.params;
    const { type } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ message: "User ID required" });
    }
    if (!["like", "love", "fire"].includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type. Use: like, love, fire" });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user already reacted
    const existingIdx = message.reactions.findIndex(
      (r) => String(r.user) === String(userId)
    );

    if (existingIdx >= 0) {
      // If same reaction, remove it (toggle off)
      if (message.reactions[existingIdx].type === type) {
        message.reactions.splice(existingIdx, 1);
      } else {
        // Different reaction, update it
        message.reactions[existingIdx].type = type;
        message.reactions[existingIdx].createdAt = new Date();
      }
    } else {
      // Add new reaction
      message.reactions.push({
        user: userId,
        type,
        createdAt: new Date(),
      });
    }

    await message.save();

    // Emit reaction update via socket if available
    const io = req.app.get("io");
    if (io) {
      const chatNamespace = io.of("/chat");
      const room = `chat:${message.chat}`;
      chatNamespace.to(room).emit("chat:reaction", {
        messageId,
        reactions: message.reactions,
      });
    }

    res.json({ ok: true, reactions: message.reactions });
  } catch (err) { next(err); }
}

/**
 * Remove user's reaction from a message
 * DELETE /api/chat/:chatId/messages/:messageId/reactions
 */
export async function removeReaction(req, res, next) {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(401).json({ message: "User ID required" });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.reactions = message.reactions.filter(
      (r) => String(r.user) !== String(userId)
    );
    await message.save();

    // Emit reaction update via socket if available
    const io = req.app.get("io");
    if (io) {
      const chatNamespace = io.of("/chat");
      const room = `chat:${message.chat}`;
      chatNamespace.to(room).emit("chat:reaction", {
        messageId,
        reactions: message.reactions,
      });
    }

    res.json({ ok: true, reactions: message.reactions });
  } catch (err) { next(err); }
}
