// frontend/src/components/powerline/ThreadList.jsx

import React from "react";
import styles from "./PowerLine.module.css";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ThreadList = ({ threads, loading, selectedId, onSelect }) => {
  return (
    <div className={styles.threadPane}>
      <div className={styles.threadHeader}>
        <div className={styles.threadTitle}>Chats</div>
      </div>

      {loading && (
        <div className={styles.threadLoading}>Loading conversations…</div>
      )}

      {!loading && (!threads || threads.length === 0) && (
        <div className={styles.threadEmpty}>
          <div>No conversations yet.</div>
          <div className={styles.threadEmptySub}>
            Start a new chat from the contacts list (coming soon).
          </div>
        </div>
      )}

      <div className={styles.threadList}>
        {threads &&
          threads.map((t) => {
            const id = t._id || t.id;
            const isActive = selectedId && selectedId === id;
            const lastMessage = t.lastMessage?.text || t.preview || "";
            const name =
              t.title ||
              t.name ||
              (t.participants && t.participants[0]?.name) ||
              "Conversation";

            return (
              <button
                key={id}
                type="button"
                className={
                  isActive
                    ? `${styles.threadItem} ${styles.threadItemActive}`
                    : styles.threadItem
                }
                onClick={() => onSelect(t)}
              >
                <div className={styles.threadAvatar}>
                  {name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className={styles.threadMeta}>
                  <div className={styles.threadMetaTop}>
                    <span className={styles.threadName}>{name}</span>
                    <span className={styles.threadTime}>
                      {formatTime(t.lastActivityAt || t.updatedAt)}
                    </span>
                  </div>
                  <div className={styles.threadPreview}>
                    {lastMessage || "No messages yet"}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default ThreadList;
