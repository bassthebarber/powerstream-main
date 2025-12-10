// frontend/src/components/chat/ChatSidebar.jsx
// PowerLine Chat Sidebar - Fixed Connection Status

import styles from '../../styles/PowerLine.module.css';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatSidebar = ({
  threads,
  loading,
  error,
  activeThreadId,
  onSelectThread,
  onRefresh,
  apiConnected = false
}) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div>
          <div className={styles.sidebarTitle}>Chats</div>
          <div className={styles.sidebarSubtitle}>
            {loading ? 'Loading...' : 'Your conversations'}
          </div>
        </div>
        <button className={styles.refreshButton} onClick={onRefresh} disabled={loading}>
          ⟳
        </button>
      </div>

      {/* Only show error if there's a real error (not just empty threads) */}
      {error && !apiConnected && (
        <div className={styles.sidebarError}>
          {error}
        </div>
      )}

      {/* Show "No conversations" only when API is connected and not loading */}
      {!loading && apiConnected && threads.length === 0 && (
        <div className={styles.sidebarEmpty}>
          No conversations yet.
          <br />
          <span style={{ fontSize: 12, opacity: 0.7 }}>
            Start a new chat to get started.
          </span>
        </div>
      )}

      <div className={styles.threadList}>
        {threads.map((thread) => {
          const isActive = thread.id === activeThreadId;
          const lastText = thread.lastMessage?.text || 'No messages yet';
          const time = formatTime(thread.lastMessage?.createdAt);

          const initials =
            thread.title
              ?.split(' ')
              .map((p) => p[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || '?';

          return (
            <button
              key={thread.id}
              className={
                isActive
                  ? `${styles.threadItem} ${styles.threadItemActive}`
                  : styles.threadItem
              }
              onClick={() => onSelectThread(thread.id)}
            >
              <div className={styles.threadAvatar}>{initials}</div>
              <div className={styles.threadMain}>
                <div className={styles.threadTopRow}>
                  <span className={styles.threadTitle}>{thread.title || 'Conversation'}</span>
                  <span className={styles.threadTime}>{time}</span>
                </div>
                <div className={styles.threadBottomRow}>
                  <span className={styles.threadPreview}>{lastText}</span>
                  {thread.unreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default ChatSidebar;
