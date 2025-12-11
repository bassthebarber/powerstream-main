import React from "react";

export default function MobileChatListDrawer({ open, onClose, threads, onSelect }) {
  return (
    <div className={`pl-mobile-drawer ${open ? "open" : ""}`}>
      <div className="pl-mobile-drawer-header">
        <h3>Messages</h3>
        <button onClick={onClose}>✕</button>
      </div>

      {threads.map((t) => (
        <div
          key={t._id || t.id}
          className="pl-mobile-thread-item"
          onClick={() => {
            onSelect(t);
            onClose();
          }}
        >
          <img src={t.avatar} className="pl-mobile-thread-avatar" alt="" />
          <div>
            <div className="pl-mobile-thread-name">{t.title}</div>
            <div className="pl-mobile-thread-last">{t.lastMessage?.text || "No messages yet"}</div>
          </div>
        </div>
      ))}
    </div>
  );
}


