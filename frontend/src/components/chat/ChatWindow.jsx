// frontend/src/components/chat/ChatWindow.jsx

import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import styles from '../../styles/PowerLine.module.css';

const ChatWindow = ({
  thread,
  messages,
  loading,
  error,
  onSendMessage
}) => {
  if (!thread) {
    return (
      <section className={styles.chatWindowEmpty}>
        <div className={styles.emptyTitle}>Select a conversation</div>
        <div className={styles.emptySubtitle}>
          Choose a chat from the left to start messaging in PowerLine.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.chatWindow}>
      <header className={styles.chatHeader}>
        <div className={styles.chatHeaderAvatar}>
          {thread.title
            ?.split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase()}
        </div>
        <div>
          <div className={styles.chatHeaderTitle}>{thread.title}</div>
          <div className={styles.chatHeaderSubtitle}>PowerLine chat</div>
        </div>
      </header>

      <div className={styles.chatMessages}>
        {loading && <div className={styles.chatStatus}>Loading messages…</div>}
        {error && <div className={styles.chatError}>{error}</div>}
        {!loading && !error && messages.length === 0 && (
          <div className={styles.chatStatus}>No messages yet.</div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      <MessageInput onSend={onSendMessage} />
    </section>
  );
};

export default ChatWindow;
