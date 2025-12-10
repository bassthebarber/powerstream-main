import React from 'react';
import './chat.module.css';

const ChatSidebar = ({ chats, onSelectChat }) => {
  return (
    <div className="chat-sidebar">
      <h3>Your Chats</h3>
      <ul>
        {chats.map((chat, index) => (
          <li key={index} onClick={() => onSelectChat(chat)}>
            {chat.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatSidebar;


