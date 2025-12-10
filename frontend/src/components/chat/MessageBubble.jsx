// frontend/src/components/chat/MessageBubble.jsx

import styles from '../../styles/PowerLine.module.css';

const MessageBubble = ({ message }) => {
  const fromSelf = message.fromSelf;

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div
      className={
        fromSelf
          ? `${styles.messageRow} ${styles.messageRowSelf}`
          : `${styles.messageRow} ${styles.messageRowOther}`
      }
    >
      {!fromSelf && (
        <div className={styles.messageAvatar}>
          {(message.senderName || 'U')
            .split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase()}
        </div>
      )}

      <div className={styles.messageBubble}>
        <div className={styles.messageText}>{message.text}</div>
        <div className={styles.messageMeta}>{time}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
