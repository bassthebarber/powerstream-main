import React from "react";

const MessageBubble = ({ message }) => {
  return (
    <div className={`message-bubble ${message.from === "me" ? "me" : "them"}`}>
      <p>{message.text}</p>
    </div>
  );
};

export default MessageBubble;


