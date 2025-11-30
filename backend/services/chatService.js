// backend/services/chatService.js
// Business logic for chat. Uses two loggers:
// - logChatEvent: general app-wide chat events
// - logServiceEvent: internal service steps
import { logChatEvent } from "../utils/logs/chatLogger.js";
import { logServiceEvent } from "./chatServiceLogger.js";

// ✅ Adjust these imports to your actual model filenames if different
//    (I saw `Chatmessage.js`/`chat.js` in your tree — pick the right one)
import ChatMessage from "../models/Chatmessagemodel.js"; // <-- change if needed
// Optional: import ChatRoom from "../models/ChatRoom.js";

function requireText(text) {
  if (!text || !text.trim()) {
    const err = new Error("Message text is required");
    err.status = 400;
    throw err;
  }
}

/**
 * Send a chat message and emit to sockets
 * @param {{ roomId: string, userId: string, text: string }} payload
 * @param {{ io?: import('socket.io').Server, MessageModel?: any }} deps
 */
export async function sendMessage(payload, deps = {}) {
  const { roomId, userId, text } = payload;
  const { io, MessageModel = ChatMessage } = deps;

  requireText(text);

  logServiceEvent("db_write_start", { roomId, userId });
  const doc = await MessageModel.create({
    roomId,
    userId,
    text: text.trim(),
    createdAt: new Date(),
  });
  logServiceEvent("db_write_ok", { id: doc._id.toString() });

  // Emit to sockets if provided
  if (io) {
    try {
      io.to(roomId).emit("chat:message", {
        id: doc._id,
        roomId,
        userId,
        text: doc.text,
        createdAt: doc.createdAt,
      });
      logServiceEvent("emit_complete", { roomId });
    } catch (err) {
      logServiceEvent("emit_failed", { error: err.message, roomId });
    }
  }

  // High-level audit log
  logChatEvent("message_sent", { roomId, userId, id: doc._id.toString() });
  return doc;
}

/**
 * Get recent messages for a room
 * @param {string} roomId
 * @param {number} limit
 * @param {{ MessageModel?: any }} deps
 */
export async function getRecentMessages(roomId, limit = 50, deps = {}) {
  const { MessageModel = ChatMessage } = deps;
  logServiceEvent("fetch_start", { roomId, limit });

  const items = await MessageModel
    .find({ roomId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  logServiceEvent("fetch_ok", { count: items.length });
  return items.reverse(); // oldest -> newest
}
