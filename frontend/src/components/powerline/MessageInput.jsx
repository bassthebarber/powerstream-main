// frontend/src/components/powerline/MessageInput.jsx

import React, { useState } from "react";
import styles from "./PowerLine.module.css";

const MessageInput = ({ onSend, sending, disabled }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className={styles.inputBar} onSubmit={handleSubmit}>
      <textarea
        className={styles.inputField}
        value={text}
        disabled={sending || disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? "Select a conversation to start chatting…"
            : "Type a message…"
        }
        rows={1}
      />
      <button
        type="submit"
        className={styles.inputSendBtn}
        disabled={sending || disabled || !text.trim()}
      >
        {sending ? "Sending…" : "Send"}
      </button>
    </form>
  );
};

export default MessageInput;
