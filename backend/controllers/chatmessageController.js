// backend/controllers/ChatMessageController.js
import Chat from "../models/ChatModel.js";
import ChatMessage from "../models/ChatMessageModel.js";

/**
 * List messages in a chat
 * GET /api/chat/:chatId/messages?limit=&cursor=
 */
export async function listMessages(req, res, next) {
  try {
    const { chatId } = req.params;
    const { limit = 50, cursor } = req.query;

    const q = { chat: chatId };
    if (cursor) q._id = { $lt: cursor };

    const items = await ChatMessage.find(q)
      .sort({ createdAt: -1, _id: -1 })
      .limit(Number(limit))
      .lean();

    const nextCursor = items.length ? items[items.length - 1]._id : null;
    res.json({ items, nextCursor });
  } catch (err) { next(err); }
}

/**
 * Send message
 * POST /api/chat/:chatId/messages
 * body: { author, text, mediaIds? }
 */
export async function sendMessage(req, res, next) {
  try {
    const { chatId } = req.params;
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
      io.to(`chat:${chatId}`).emit("chat:message", doc);
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
