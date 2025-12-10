// frontend/src/components/powerline/MessageList.jsx

import React, { useEffect, useRef } from "react";
import styles from "./PowerLine.module.css";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const MessageList = ({ thread, messages, loading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const name =
    thread?.title ||
    thread?.name ||
    (thread?.participants && thread.participants[0]?.name) ||
    "Conversation";

  return (
    <div className={styles.messagePane}>
      <div className={styles.messageHeader}>
        <div className={styles.messageHeaderName}>{name}</div>
        <div className={styles.messageHeaderSub}>PowerLine secure chat</div>
      </div>

      <div className={styles.messageScroll}>
        {loading && (
          <div className={styles.messageLoading}>Loading messages…</div>
        )}

        {!loading && (!messages || messages.length === 0) && (
          <div className={styles.messageEmpty}>
            <div>No messages yet.</div>
            <div className={styles.messageEmptySub}>
              Say hello and break the ice.
            </div>
          </div>
        )}

        {messages &&
          messages.map((m) => {
            const id = m._id || m.id;
            const isMine = m.isMine || m.isSelf || m.fromSelf;
            const authorName =
              m.sender?.name ||
              m.authorName ||
              m.senderName ||
              m.sender?.email ||
              "User";

            return (
              <div
                key={id}
                className={
                  isMine
                    ? `${styles.messageRow} ${styles.messageRowMine}`
                    : styles.messageRow
                }
              >
                {!isMine && (
                  <div className={styles.messageAvatar}>
                    {authorName
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div className={styles.messageBubbleWrapper}>
                  {!isMine && (
                    <div className={styles.messageAuthor}>{authorName}</div>
                  )}
                  <div className={styles.messageBubble}>{m.text}</div>
                  <div className={styles.messageMeta}>
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;
