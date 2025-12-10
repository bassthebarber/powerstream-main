import { useEffect } from "react";
import { useChat } from "./chatContext";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001");

export const useChatSocket = () => {
  const { setMessages } = useChat();

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });
  }, []);
};


