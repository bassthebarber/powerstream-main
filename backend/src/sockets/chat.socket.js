// backend/src/sockets/chat.socket.js
// Chat/PowerLine socket handler
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { logger } from "../config/logger.js";
import chatService from "../services/chat.service.js";

/**
 * Attach chat socket handlers to Socket.IO namespace
 * @param {Server} io - Socket.IO server instance
 */
export default function attachChatSocket(io) {
  const chatNsp = io.of("/chat");

  // Authentication middleware for chat namespace
  chatNsp.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      };

      next();
    } catch (err) {
      logger.warn("Chat socket auth failed:", err.message);
      next(new Error("Invalid token"));
    }
  });

  chatNsp.on("connection", (socket) => {
    logger.debug(`Chat socket connected: ${socket.userId}`);

    // Join a conversation/thread room
    socket.on("join:thread", (threadId) => {
      if (!threadId) return;
      const room = `thread:${threadId}`;
      socket.join(room);
      logger.debug(`User ${socket.userId} joined thread ${threadId}`);
    });

    // Leave a conversation/thread room
    socket.on("leave:thread", (threadId) => {
      if (!threadId) return;
      const room = `thread:${threadId}`;
      socket.leave(room);
      logger.debug(`User ${socket.userId} left thread ${threadId}`);
    });

    // Send a message
    socket.on("message:send", async (data) => {
      try {
        const { threadId, text, type, media } = data;

        if (!threadId) {
          socket.emit("error", { message: "Thread ID required" });
          return;
        }

        // Save message via service
        const message = await chatService.sendMessage(socket.userId, threadId, {
          text,
          type: type || "text",
          mediaUrl: media?.url,
        });

        // Broadcast to thread room
        chatNsp.to(`thread:${threadId}`).emit("message:new", {
          ...message.toObject ? message.toObject() : message,
          sender: socket.user,
        });

        logger.debug(`Message sent to thread ${threadId} by ${socket.userId}`);
      } catch (err) {
        logger.error("Error sending message via socket:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator start
    socket.on("typing:start", ({ threadId }) => {
      if (!threadId) return;
      socket.to(`thread:${threadId}`).emit("user:typing", {
        userId: socket.userId,
        user: socket.user,
      });
    });

    // Typing indicator stop
    socket.on("typing:stop", ({ threadId }) => {
      if (!threadId) return;
      socket.to(`thread:${threadId}`).emit("user:stopped-typing", {
        userId: socket.userId,
      });
    });

    // Mark messages as read
    socket.on("message:read", async ({ threadId, messageIds }) => {
      try {
        await chatService.markAsRead(threadId, socket.userId, messageIds);

        // Notify other users in the thread
        socket.to(`thread:${threadId}`).emit("message:read-receipt", {
          threadId,
          messageIds,
          readBy: socket.userId,
          readAt: new Date(),
        });
      } catch (err) {
        logger.error("Error marking messages read:", err.message);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      logger.debug(`Chat socket disconnected: ${socket.userId}`);
    });
  });

  logger.info("✅ Chat socket namespace attached (/chat)");
  return chatNsp;
}

