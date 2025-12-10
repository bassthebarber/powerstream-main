// backend/src/api/powerline/powerline.socket.js
// PowerLine Socket.IO Handler - Real-time messaging

import jwt from "jsonwebtoken";
import Conversation from "../../../models/Conversation.js";
import Message from "../../../models/Message.js";
import User from "../../../models/User.js";

/**
 * Initialize PowerLine Socket.IO namespace
 */
export function initPowerlineSocket(io) {
  const nsp = io.of("/powerline");

  // Authentication middleware
  nsp.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        console.log("[PowerLine Socket] No token provided");
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.sub || decoded.id || decoded.userId;

      const user = await User.findById(userId).select("name username avatarUrl").lean();
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = {
        id: userId,
        _id: userId,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
      };

      next();
    } catch (err) {
      console.error("[PowerLine Socket] Auth error:", err.message);
      next(new Error("Invalid token"));
    }
  });

  nsp.on("connection", (socket) => {
    console.log(`[PowerLine Socket] Connected: ${socket.user?.name} (${socket.id})`);

    // Join user's personal room for notifications
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    // Join a conversation room
    socket.on("conversation:join", async (conversationId) => {
      try {
        if (!conversationId) return;

        // Verify user is participant
        const conversation = await Conversation.findById(conversationId)
          .select("participants")
          .lean();

        if (!conversation) {
          return socket.emit("error", { message: "Conversation not found" });
        }

        const isParticipant = conversation.participants.some(
          (p) => String(p) === String(socket.user.id)
        );

        if (!isParticipant) {
          return socket.emit("error", { message: "Not a participant" });
        }

        socket.join(`conversation:${conversationId}`);
        socket.join(`thread:${conversationId}`); // Legacy support
        console.log(`[PowerLine Socket] ${socket.user.name} joined conversation:${conversationId}`);

        socket.emit("conversation:joined", { conversationId });
      } catch (err) {
        console.error("[PowerLine Socket] Join error:", err);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // Leave a conversation room
    socket.on("conversation:leave", (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
      socket.leave(`thread:${conversationId}`);
      console.log(`[PowerLine Socket] ${socket.user?.name} left conversation:${conversationId}`);
    });

    // Send a message via socket
    socket.on("message:send", async ({ conversationId, text, type, media, replyTo }) => {
      try {
        if (!conversationId || (!text && !media)) {
          return socket.emit("error", { message: "Invalid message data" });
        }

        // Verify conversation & participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit("error", { message: "Conversation not found" });
        }

        const isParticipant = conversation.participants.some(
          (p) => String(p) === String(socket.user.id)
        );
        if (!isParticipant) {
          return socket.emit("error", { message: "Not a participant" });
        }

        // Create message
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user.id,
          text: text?.trim() || "",
          type: type || "text",
          media: media || [],
          replyTo: replyTo || null,
          status: "sent",
        });

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastActivityAt = new Date();
        await conversation.save();

        // Populate for broadcast
        const populated = await Message.findById(message._id)
          .populate("sender", "name username avatarUrl")
          .lean();

        const formatted = {
          id: populated._id,
          _id: populated._id,
          conversationId,
          threadId: conversationId,
          text: populated.text,
          type: populated.type,
          sender: populated.sender,
          media: populated.media,
          replyTo: populated.replyTo,
          status: "sent",
          createdAt: populated.createdAt,
        };

        // Broadcast to room
        nsp.to(`conversation:${conversationId}`).emit("message:new", formatted);
        nsp.to(`thread:${conversationId}`).emit("message:new", formatted);

        // Notify other participants
        io.emit("conversation:updated", {
          conversationId,
          lastMessage: {
            text: formatted.text,
            sender: formatted.sender,
            createdAt: formatted.createdAt,
          },
        });

        console.log(`[PowerLine Socket] Message sent in ${conversationId} by ${socket.user.name}`);
      } catch (err) {
        console.error("[PowerLine Socket] Send error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing:start", (conversationId) => {
      if (!conversationId || !socket.user) return;
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        user: socket.user,
      });
    });

    socket.on("typing:stop", (conversationId) => {
      if (!conversationId || !socket.user) return;
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        conversationId,
        userId: socket.user.id,
      });
    });

    // Mark messages as read
    socket.on("messages:read", async ({ conversationId, messageIds }) => {
      try {
        if (!conversationId || !socket.user) return;

        // Update read status
        if (messageIds && messageIds.length > 0) {
          await Message.updateMany(
            { _id: { $in: messageIds } },
            {
              $addToSet: {
                readBy: { user: socket.user.id, readAt: new Date() },
              },
              $set: { status: "read" },
            }
          );
        }

        // Broadcast read receipt
        socket.to(`conversation:${conversationId}`).emit("messages:read", {
          conversationId,
          userId: socket.user.id,
          messageIds,
          readAt: new Date(),
        });
      } catch (err) {
        console.error("[PowerLine Socket] Read error:", err);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`[PowerLine Socket] Disconnected: ${socket.user?.name} (${socket.id})`);
    });
  });

  return nsp;
}

export default initPowerlineSocket;



