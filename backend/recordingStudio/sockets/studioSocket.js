// backend/sockets/studioSocket.js
export function initStudioSocket(io) {
  io.on("connection", (socket) => {
    console.log("[StudioSocket] client connected", socket.id);
    socket.on("disconnect", () => console.log("[StudioSocket] client disconnected", socket.id));
  });
}
