// frontend/components/ChatRoom.js

import React, { useEffect, useRef, useState } from 'react';
import { sendMessageSocket, initChatSocket } from '../sockets/chatSocket';

const ChatRoom = ({ userId, roomId, messages, onMessageReceive }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    initChatSocket(userId, roomId, onMessageReceive);
  }, [userId, roomId]);

  const handleSend = () => {
    if (!input.trim()) return;

    sendMessageSocket({
      senderId: userId,
      roomId,
      message: input,
      type: 'text',
    });

    setInput('');
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg._id} className={`msg ${msg.senderId === userId ? 'me' : 'them'}`}>
            <p>{msg.content}</p>
            <small>{msg.status}</small>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
