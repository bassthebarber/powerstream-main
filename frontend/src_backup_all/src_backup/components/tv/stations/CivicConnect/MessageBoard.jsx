import React, { useEffect, useState } from 'react';

const MessageBoard = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetch('/api/civic/messages')
      .then(res => res.json())
      .then(setMessages);
  }, []);

  const submitMessage = async () => {
    if (!username || !messageText) return alert('Fill out both fields');

    try {
      const res = await fetch('/api/civic/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message: messageText }),
      });
      const data = await res.json();
      setMessages([data, ...messages]);
      setUsername('');
      setMessageText('');
    } catch (err) {
      console.error(err);
      alert('Message failed to send');
    }
  };

  return (
    <div className="message-board">
      <h3>💬 Community Message Wall</h3>

      <div className="message-form">
        <input
          type="text"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <textarea
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button onClick={submitMessage}>Post Message</button>
      </div>

      <ul className="message-feed">
        {messages.map((msg, i) => (
          <li key={i}>
            <strong>{msg.username}</strong>: {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageBoard;
