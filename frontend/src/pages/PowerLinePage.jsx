import React from "react";
import ConversationList from "../components/powerline/ConversationList.jsx";
import MessageThread from "../components/powerline/MessageThread.jsx";

export default function PowerLinePage() {
  return (
    <div className="ps-page">
      <div className="pl-shell">
        <aside className="ps-card" style={{ padding: 16 }}>
          <ConversationList />
        </aside>
        <main className="ps-card" style={{ padding: 0, overflow: "hidden" }}>
          <MessageThread />
        </main>
        <aside className="ps-card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 8 }}>Chat details</h3>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>
            Participant list, pinned messages, and media gallery will appear
            here.
          </p>
        </aside>
      </div>
    </div>
  );
}
