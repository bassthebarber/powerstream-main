// frontend/src/components/powerline/MessageComposer.jsx
// PowerLine V5 - Message Composer Component

import { useState, useRef, useEffect } from 'react';
import styles from './PowerLine.module.css';

const MessageComposer = ({
  threadId,
  onSend,
  onTyping,
  onStopTyping,
  disabled = false
}) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Focus input when thread changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [threadId]);

  // Handle typing indicator
  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);

    // Emit typing event
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(threadId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onStopTyping?.(threadId);
      }
    }, 2000);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      setIsTyping(false);
      onStopTyping?.(threadId);
    }

    // Send message
    onSend(trimmed);
    setText('');

    // Refocus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className={styles.composer}>
      <div className={styles.composerInner}>
        {/* Emoji Button (stub) */}
        <button 
          className={styles.composerBtn} 
          type="button"
          title="Emoji (coming soon)"
          disabled
        >
          😊
        </button>

        {/* Text Input */}
        <textarea
          ref={inputRef}
          className={styles.composerInput}
          placeholder="Type a message..."
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
        />

        {/* Mic Button (stub) */}
        <button 
          className={styles.composerBtn} 
          type="button"
          title="Voice message (coming soon)"
          disabled
        >
          🎤
        </button>

        {/* Send Button */}
        <button
          className={styles.sendBtn}
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          title="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;



