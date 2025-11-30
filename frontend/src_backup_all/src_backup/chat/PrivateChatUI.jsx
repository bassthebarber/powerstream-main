import React from "react";
import MessageBubble from "./messageBubble";

const PrivateChatUI = ({ chat, messages }) => {
  return (
    <div className="private-chat-ui">
      <h3>Chat with {chat.name}</h3>
      <div className="messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
      </div>
    </div>
  );
};

export default PrivateChatUI;


