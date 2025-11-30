// sockets/callSocketHandler.js
import { io } from "socket.io-client";

let socket;

export const initCallSocket = (serverUrl) => {
  socket = io(serverUrl, { transports: ["websocket"] });

  socket.on("connect", () => {
    console.log("Call socket connected:", socket.id);
  });

  socket.on("incoming-call", (data) => {
    console.log("Incoming call from:", data.callerId);
    if (window.onIncomingCall) {
      window.onIncomingCall(data);
    }
  });

  socket.on("call-ended", () => {
    console.log("Call ended");
    if (window.onCallEnded) {
      window.onCallEnded();
    }
  });

  return socket;
};

export const emitCallEvent = (event, payload) => {
  if (socket) {
    socket.emit(event, payload);
  }
};

export const closeCallSocket = () => {
  if (socket) socket.disconnect();
};
