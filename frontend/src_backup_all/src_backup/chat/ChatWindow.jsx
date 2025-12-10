import React from "react";
import { useChat } from "./chatContext";
import MessageBubble from "./messageBubble";

const ChatWindow = () => {
  const { activeChat, messages } = useChat();

  if (!activeChat) return <div className="chat-window">Select a chat to start</div>;

  return (
    <div className="chat-window">
      <h3>{activeChat.name}</h3>
      <div className="messages">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
      </div>
    </div>
  );
};

export default ChatWindow;


