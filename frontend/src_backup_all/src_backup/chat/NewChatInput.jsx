import React, { useState } from "react";
import { useChat } from "./chatContext";

const NewChatInput = () => {
  const { setMessages } = useChat();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() === "") return;
    const newMsg = { text, from: "me", timestamp: Date.now() };
    setMessages(prev => [...prev, newMsg]);
    setText("");
  };

  return (
    <div className="new-chat-input">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type message..." />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default NewChatInput;


