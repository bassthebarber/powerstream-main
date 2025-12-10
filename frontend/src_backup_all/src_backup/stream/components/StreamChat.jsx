// frontend/components/stream/StreamChat.js
import React, { useState } from 'react';

export default function StreamChat({ onSend }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    if (onSend) onSend(message);
    setMessage('');
  };

  return (
    <div className="stream-chat">
      <div className="chat-messages" id="chat-messages">
        {/* Map chat messages here */}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}


