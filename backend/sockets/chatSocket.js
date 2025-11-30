// backend/sockets/chatSocket.js
export default function chatSocket(io) {
  io.on("connection", (socket) => {
    // Join a chat room for real-time messages
    socket.on("chat:join", ({ chatId }) => {
      if (chatId) socket.join(`chat:${chatId}`);
    });

    // Optional typing indicators
    socket.on("chat:typing", ({ chatId, userId, isTyping }) => {
      if (!chatId) return;
      socket.to(`chat:${chatId}`).emit("chat:typing", { chatId, userId, isTyping });
    });

    // Client can also emit "chat:message" to broadcast (server will validate & re-emit)
    socket.on("chat:message", ({ chatId, message }) => {
      if (!chatId || !message) return;
      // This path only broadcasts; persistence should use the REST endpoint
      io.to(`chat:${chatId}`).emit("chat:message", message);
    });
  });
}
