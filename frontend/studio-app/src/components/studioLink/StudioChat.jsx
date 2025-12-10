import React, { useState } from 'react';

const StudioChat = () => {
  const [messages, setMessages] = useState([
    { from: 'System', text: 'Welcome to StudioLink Chat!' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'You', text: input }]);
    setInput('');
  };

  return (
    <div className="studioPanel chat-panel">
      <h2>💬 Studio Chat</h2>
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.from === 'You' ? 'user' : 'system'}`}>
            <strong>{msg.from}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default StudioChat;
