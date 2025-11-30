// frontend/hooks/UseStreamChat.js
import { useState, useEffect } from 'react';

export default function useStreamChat(streamId) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!streamId) return;

    // WebSocket connection for live chat
    const ws = new WebSocket(`wss://your-chat-server/${streamId}`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    return () => {
      ws.close();
    };
  }, [streamId]);

  const sendMessage = (text, sender = 'User') => {
    const newMsg = { sender, text, timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);

    // Send to server (WebSocket or API)
    fetch(`/api/streams/${streamId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    }).catch((err) => console.error('Send chat error:', err));
  };

  return { messages, sendMessage };
}


