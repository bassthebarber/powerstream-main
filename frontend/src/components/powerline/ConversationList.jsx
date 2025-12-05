import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/api.js";

export default function ConversationList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/powerline/conversations?user=${user.id}`);
      if (res.data?.items) {
        setConversations(res.data.items);
      } else if (Array.isArray(res.data)) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (conversation) => {
    setSelectedId(conversation._id);
    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
        Loading chats...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        placeholder="Search chats…"
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "#111",
          color: "#fff",
          fontSize: 13,
          marginBottom: 8,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {conversations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)", fontSize: 13 }}>
            No conversations yet. Start a new chat!
          </div>
        ) : (
          conversations.map((c) => {
            const initials = c.title
              ? c.title
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "CH";
            const lastMessage = c.lastMessage || "No messages yet";
            const isSelected = selectedId === c._id;

            return (
              <button
                key={c._id}
                type="button"
                onClick={() => handleSelect(c)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: 8,
                  borderRadius: 10,
                  border: "none",
                  background: isSelected ? "rgba(230,184,0,0.2)" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: "linear-gradient(135deg,#f5b301,#ffda5c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "#000",
                    fontWeight: 700,
                    position: "relative",
                  }}
                >
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        color: "#fff",
                      }}
                    >
                      {c.title || "Chat"}
                    </span>
                    {c.lastMessageAt && (
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>
                        {new Date(c.lastMessageAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {typeof lastMessage === "string" ? lastMessage : lastMessage?.text || "No messages"}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
