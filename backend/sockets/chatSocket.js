// backend/sockets/chatSocket.js
// DEPRECATED: This socket is part of the LEGACY architecture.
// Runtime traffic is being migrated to /backend/src/sockets/chat.socket.js
// Do NOT add new features here.
import jwt from "jsonwebtoken";
import { User } from "../src/domain/models/index.js";
import env from "../src/config/env.js";

/**
 * Initialize chat socket namespace
 * Handles real-time chat messaging via Socket.io
 */
export default function initChatSocket(io) {
  const chatNamespace = io.of("/chat");

  // Authentication middleware for socket connections
  chatNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify JWT token using centralized config
      let decoded;
      try {
        decoded = jwt.verify(token, env.JWT_SECRET);
      } catch (jwtError) {
        return next(new Error("Authentication error: Invalid token"));
      }

      // Find user
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket
      socket.userId = user._id.toString();
      socket.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        username: user.username,
      };

      next();
    } catch (error) {
      console.error("Socket auth error:", error);
      next(new Error("Authentication error"));
    }
  });

  chatNamespace.on("connection", (socket) => {
    console.log(`✅ Chat socket connected: ${socket.userId} (${socket.user?.name || "Unknown"})`);

    // Join chat room
    socket.on("chat:join", (chatId) => {
      if (!chatId) return;
      const room = `chat:${chatId}`;
      socket.join(room);
      console.log(`${socket.user?.name || socket.userId} joined room: ${room}`);
      
      // Notify others
      socket.to(room).emit("chat:user-joined", {
        userId: socket.userId,
        name: socket.user?.name,
        chatId,
      });
    });

    // Leave chat room
    socket.on("chat:leave", (chatId) => {
      if (!chatId) return;
      const room = `chat:${chatId}`;
      socket.leave(room);
      console.log(`${socket.user?.name || socket.userId} left room: ${room}`);
      
      // Notify others
      socket.to(room).emit("chat:user-left", {
        userId: socket.userId,
        name: socket.user?.name,
        chatId,
      });
    });

    // Handle new message
    socket.on("chat:message", async (data) => {
      const { chatId, content, type = "text" } = data || {};
      if (!chatId || !content) return;

      const message = {
        id: Date.now().toString(),
        chatId,
        senderId: socket.userId,
        senderName: socket.user?.name || "Unknown",
        content,
        type,
        createdAt: new Date().toISOString(),
      };

      const room = `chat:${chatId}`;
      
      // Emit to all in room including sender
      chatNamespace.to(room).emit("chat:message", message);
      
      console.log(`Message in ${room} from ${socket.user?.name}: ${content.substring(0, 50)}...`);
    });

    // Typing indicator
    socket.on("chat:typing", (data) => {
      const { chatId, isTyping } = data || {};
      if (!chatId) return;
      
      const room = `chat:${chatId}`;
      socket.to(room).emit("chat:typing", {
        userId: socket.userId,
        name: socket.user?.name,
        isTyping,
      });
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(`❌ Chat socket disconnected: ${socket.userId} (${reason})`);
    });
  });

  console.log("✅ Chat socket namespace initialized: /chat");
  return chatNamespace;
}

export { initChatSocket };
