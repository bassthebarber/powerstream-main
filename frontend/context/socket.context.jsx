// frontend/src/context/socket.context.jsx
import { createContext, useContext } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_API || "http://localhost:5001");

export const SocketContext = createContext(socket);

export const useSocket = () => useContext(SocketContext);
