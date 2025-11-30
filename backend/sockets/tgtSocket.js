// TGTSocket.js

let tgtClients = [];

export const initTGTSocket = (io) => {
  io.of("/tgt").on("connection", (socket) => {
    console.log("🎤 New Texas Got Talent socket connected:", socket.id);
    tgtClients.push(socket.id);

    socket.on("tgt_vote", (data) => {
      console.log("🗳️ TGT Vote Received:", data);
      io.of("/tgt").emit("new_tgt_vote", data);
    });

    socket.on("tgt_comment", (msg) => {
      console.log("💬 TGT Comment:", msg);
      io.of("/tgt").emit("new_tgt_comment", msg);
    });

    socket.on("disconnect", () => {
      console.log("❌ TGT socket disconnected:", socket.id);
      tgtClients = tgtClients.filter((id) => id !== socket.id);
    });
  });
};
