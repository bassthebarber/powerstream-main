import socket from "./SocketClient";

export function emitMessage(roomId, message) {
  socket.emit("sendMessage", { roomId, message });
}

export function onMessage(callback) {
  socket.on("receiveMessage", callback);
}


