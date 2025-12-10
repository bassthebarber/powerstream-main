// backend/sockets/streamStatusSocket.js
import StreamStatus from "../models/StreamStatusModel.js";

export default function streamStatusSocket(io) {
  io.on("connection", (socket) => {
    socket.on("stream:join", ({ streamId }) => {
      if (streamId) socket.join(`stream:${streamId}`);
    });

    socket.on("stream:status:update", async (payload) => {
      // payload: { stream, station, status, health, bitrateKbps, fps, droppedFrames, viewers, notes }
      try {
        const doc = await StreamStatus.create(payload);
        io.to(`stream:${payload.stream}`).emit("stream:status", doc);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });
  });
}
