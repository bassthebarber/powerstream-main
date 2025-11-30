// frontend/src/utils/SocketClient.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5001", {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;


