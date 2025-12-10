// frontend/src/components/chat/MessageInput.jsx

import { useState } from 'react';
import styles from '../../styles/PowerLine.module.css';

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.messageInputBar}>
      <textarea
        className={styles.messageInput}
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <button className={styles.sendButton} onClick={handleSend}>
        ➤
      </button>
    </div>
  );
};

export default MessageInput;
