// frontend/src/components/powerline/UserPanel.jsx
// PowerLine V5 - User Panel Component

import styles from './PowerLine.module.css';

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  const d = new Date(dateString);
  return d.toLocaleDateString([], { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
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

const UserPanel = ({ thread = null, isOnline = false }) => {
  // No thread selected
  if (!thread) {
    return (
      <aside className={styles.userPanel}>
        <div className={styles.userPanelEmpty}>
          <div className={styles.userPanelEmptyIcon}>👤</div>
          <p>Select a conversation to see user details</p>
        </div>
      </aside>
    );
  }

  // Extract user info from thread
  const otherParticipant = thread.participants?.find(p => p && !p.isSelf) || {};
  const userName = thread.title || otherParticipant.name || 'User';
  const userEmail = otherParticipant.email || 'Not available';
  const userJoined = otherParticipant.createdAt || thread.createdAt;
  const initials = getInitials(userName);

  return (
    <aside className={styles.userPanel}>
      {/* Header with Avatar */}
      <div className={styles.userPanelHeader}>
        <div className={styles.userPanelAvatar}>{initials}</div>
        <h2 className={styles.userPanelName}>{userName}</h2>
        <p className={`${styles.userPanelStatus} ${!isOnline ? styles.userPanelStatusOffline : ''}`}>
          {isOnline ? '● Online' : '○ Offline'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className={styles.userPanelActions}>
        <button className={styles.userPanelActionBtn} disabled>
          <span className={styles.userPanelActionIcon}>📞</span>
          <span className={styles.userPanelActionLabel}>Call</span>
        </button>
        <button className={styles.userPanelActionBtn} disabled>
          <span className={styles.userPanelActionIcon}>📹</span>
          <span className={styles.userPanelActionLabel}>Video</span>
        </button>
      </div>

      {/* User Info */}
      <div className={styles.userPanelInfo}>
        <div className={styles.userPanelInfoItem}>
          <span className={styles.userPanelInfoLabel}>Email</span>
          <span className={styles.userPanelInfoValue}>{userEmail}</span>
        </div>
        <div className={styles.userPanelInfoItem}>
          <span className={styles.userPanelInfoLabel}>Joined</span>
          <span className={styles.userPanelInfoValue}>{formatDate(userJoined)}</span>
        </div>
        <div className={styles.userPanelInfoItem}>
          <span className={styles.userPanelInfoLabel}>Chat Started</span>
          <span className={styles.userPanelInfoValue}>{formatDate(thread.createdAt)}</span>
        </div>
        <div className={styles.userPanelInfoItem}>
          <span className={styles.userPanelInfoLabel}>Messages</span>
          <span className={styles.userPanelInfoValue}>
            {thread.messageCount || '—'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default UserPanel;



