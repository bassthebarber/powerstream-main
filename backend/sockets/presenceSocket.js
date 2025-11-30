// backend/sockets/presenceSocket.js
import UserPresence from "../models/UserPresenceModel.js";

export default function presenceSocket(io) {
  io.on("connection", (socket) => {
    // Optional identity (if you pass userId in a handshake/query)
    const userId = socket.handshake?.auth?.userId || socket.handshake?.query?.userId;

    async function markOnline() {
      if (!userId) return;
      await UserPresence.findOneAndUpdate(
        { user: userId },
        { $set: { status: "online", lastSeenAt: new Date() } },
        { upsert: true }
      );
      io.emit("presence:online", { userId });
    }

    async function markOffline() {
      if (!userId) return;
      await UserPresence.findOneAndUpdate(
        { user: userId },
        { $set: { status: "offline", lastSeenAt: new Date() } },
        { upsert: true }
      );
      io.emit("presence:offline", { userId });
    }

    // Join room if provided
    socket.on("presence:join", async ({ roomId }) => {
      if (roomId) socket.join(roomId);
      await markOnline();
    });

    socket.on("presence:touch", async () => {
      if (!userId) return;
      await UserPresence.findOneAndUpdate(
        { user: userId },
        { $set: { lastSeenAt: new Date(), status: "online" } },
        { upsert: true }
      );
      socket.emit("presence:touched", { ok: true, at: new Date().toISOString() });
    });

    socket.on("disconnect", async () => {
      await markOffline();
    });

    // mark online on connect if we know the user
    markOnline().catch(() => {});
  });
}
