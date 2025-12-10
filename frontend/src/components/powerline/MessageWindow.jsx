// frontend/src/components/powerline/MessageWindow.jsx
// PowerLine V5 - Message Window Component

import { useEffect, useRef } from 'react';
import MessageComposer from './MessageComposer';
import styles from './PowerLine.module.css';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const MessageWindow = ({
  thread = null,
  messages = [],
  loading = false,
  error = null,
  typingUsers = [],
  onSendMessage,
  onTyping,
  onStopTyping
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // No thread selected
  if (!thread) {
    return (
      <section className={styles.messageWindow}>
        <div className={styles.noThreadSelected}>
          <div className={styles.noThreadIcon}>💬</div>
          <h2 className={styles.noThreadTitle}>Select a conversation</h2>
          <p className={styles.noThreadText}>
            Choose a chat from the left to start messaging
          </p>
        </div>
      </section>
    );
  }

  const initials = getInitials(thread.title);
  const isTyping = typingUsers.length > 0;

  return (
    <section className={styles.messageWindow}>
      {/* Header */}
      <header className={styles.messageHeader}>
        <div className={styles.messageHeaderInfo}>
          <div className={styles.headerAvatar}>{initials}</div>
          <div>
            <div className={styles.headerName}>{thread.title || 'Conversation'}</div>
            <div className={`${styles.headerStatus} ${isTyping ? styles.headerStatusTyping : ''}`}>
              {isTyping ? 'Typing...' : 'PowerLine Chat'}
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerActionBtn} title="Voice Call (coming soon)">
            📞
          </button>
          <button className={styles.headerActionBtn} title="Video Call (coming soon)">
            📹
          </button>
          <button className={styles.headerActionBtn} title="Info">
            ℹ️
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {loading && (
          <div className={styles.emptyMessages}>
            <div className={styles.emptyMessagesIcon}>⏳</div>
            <p className={styles.emptyMessagesText}>Loading messages...</p>
          </div>
        )}

        {error && (
          <div className={styles.emptyMessages}>
            <div className={styles.emptyMessagesIcon}>⚠️</div>
            <p className={styles.emptyMessagesText}>{error}</p>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className={styles.emptyMessages}>
            <div className={styles.emptyMessagesIcon}>👋</div>
            <h3 className={styles.emptyMessagesTitle}>No messages yet</h3>
            <p className={styles.emptyMessagesText}>
              Send a message to start the conversation!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isSelf = msg.fromSelf;
          const senderInitials = getInitials(msg.senderName || (isSelf ? 'Me' : 'User'));

          return (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${isSelf ? styles.messageRowSelf : styles.messageRowOther}`}
            >
              {!isSelf && (
                <div className={styles.messageAvatar}>{senderInitials}</div>
              )}
              <div className={`${styles.messageBubble} ${isSelf ? styles.messageBubbleSelf : styles.messageBubbleOther}`}>
                <div className={styles.messageText}>{msg.text}</div>
                <div className={styles.messageTime}>{formatTime(msg.createdAt)}</div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <MessageComposer
        threadId={thread.id}
        onSend={onSendMessage}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
      />
    </section>
  );
};

export default MessageWindow;



