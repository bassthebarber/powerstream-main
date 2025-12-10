import React from "react";
import { useChat } from "./chatContext";

const ChatList = ({ chats }) => {
  const { setActiveChat } = useChat();

  return (
    <div className="chat-list">
      {chats.map((chat, idx) => (
        <div key={idx} onClick={() => setActiveChat(chat)} className="chat-list-item">
          {chat.name}
        </div>
      ))}
    </div>
  );
};

export default ChatList;


