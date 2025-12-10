// CivicSockets.js
export default function CivicSockets(io) {
  const civic = io.of("/civic");

  civic.on("connection", (socket) => {
    console.log("🔌 Civic Connect socket connected:", socket.id);

    socket.on("civic-chat", (data) => {
      civic.emit("civic-chat", data);
    });

    socket.on("civic-vote", (vote) => {
      civic.emit("civic-vote", vote);
    });

    socket.on("disconnect", () => {
      console.log("❌ Civic socket disconnected:", socket.id);
    });
  });
}
