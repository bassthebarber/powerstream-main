// frontend/src/components/powerline/ConversationList.jsx
// PowerLine V5 - Conversation List Component

import { useState } from 'react';
import styles from './PowerLine.module.css';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const diff = now - d;
  
  // Today: show time
  if (diff < 24 * 60 * 60 * 1000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  // Yesterday
  if (diff < 48 * 60 * 60 * 1000) {
    return 'Yesterday';
  }
  // This week: show day name
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  // Older: show date
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
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

const ConversationList = ({
  threads = [],
  loading = false,
  error = null,
  selectedThreadId = null,
  onSelectThread,
  onRefresh,
  isConnected = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = threads.filter((thread) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      thread.title?.toLowerCase().includes(query) ||
      thread.lastMessage?.text?.toLowerCase().includes(query)
    );
  });

  return (
    <aside className={styles.conversationList}>
      {/* Header */}
      <div className={styles.conversationHeader}>
        <h1 className={styles.conversationTitle}>PowerLine</h1>
        <p className={styles.conversationSubtitle}>
          {isConnected ? '● Connected' : 'Connecting...'}
        </p>
        <button className={styles.newChatButton} disabled>
          + New Chat (coming soon)
        </button>
      </div>

      {/* Search */}
      <div className={styles.conversationSearch}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Connection Status */}
      {error && (
        <div className={`${styles.connectionStatus} ${styles.connectionStatusDisconnected}`}>
          {error}
        </div>
      )}

      {/* Threads List */}
      <div className={styles.threadsList}>
        {loading && (
          <div className={styles.emptyThreads}>
            <div className={styles.emptyIcon}>⏳</div>
            <p>Loading conversations...</p>
          </div>
        )}

        {!loading && filteredThreads.length === 0 && (
          <div className={styles.emptyThreads}>
            <div className={styles.emptyIcon}>💬</div>
            <p>No conversations yet</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              Start chatting with someone!
            </p>
          </div>
        )}

        {filteredThreads.map((thread) => {
          const isActive = thread.id === selectedThreadId;
          const initials = getInitials(thread.title);
          const lastText = thread.lastMessage?.text || 'No messages yet';
          const time = formatTime(thread.lastMessage?.createdAt || thread.updatedAt);

          return (
            <button
              key={thread.id}
              className={`${styles.threadItem} ${isActive ? styles.threadItemActive : ''}`}
              onClick={() => onSelectThread(thread.id)}
            >
              <div className={styles.threadAvatar}>{initials}</div>
              <div className={styles.threadInfo}>
                <div className={styles.threadName}>{thread.title || 'Conversation'}</div>
                <div className={styles.threadPreview}>{lastText}</div>
              </div>
              <div className={styles.threadMeta}>
                <span className={styles.threadTime}>{time}</span>
                {thread.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{thread.unreadCount}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default ConversationList;
