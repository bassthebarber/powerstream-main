// frontend/src/components/ChatSidebar.jsx
// PowerLine conversation list sidebar
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";

export default function ChatSidebar({ onSelectConversation, selectedConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Try multiple endpoints
      let convs = [];
      
      try {
        const res = await api.get(`/powerline/conversations?user=${user.id}`);
        if (res.data?.items) {
          convs = res.data.items;
        } else if (res.data?.conversations) {
          convs = res.data.conversations;
        } else if (Array.isArray(res.data)) {
          convs = res.data;
        }
      } catch (err) {
        // Try fallback endpoint
        try {
          const res = await api.get(`/chat?user=${user.id}`);
          if (res.data?.items) {
            convs = res.data.items;
          } else if (res.data?.chats) {
            convs = res.data.chats;
          } else if (Array.isArray(res.data)) {
            convs = res.data;
          }
        } catch (err2) {
          console.warn("Chat API not available, using empty list");
          // Don't throw - just show empty state
        }
      }
      
      setConversations(convs);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Could not load conversations");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Try to set up socket for real-time updates (optional, won't crash if unavailable)
  useEffect(() => {
    let socket = null;
    let cleanup = () => {};

    const setupSocketListener = async () => {
      try {
        const { getChatSocket } = await import("../lib/socket.js");
        socket = getChatSocket();
        
        if (!socket) return;

        const handleMessage = (message) => {
          if (message.chat) {
            const chatId = String(message.chat);
            if (chatId !== String(selectedConversationId)) {
              setUnreadCounts((prev) => ({
                ...prev,
                [chatId]: (prev[chatId] || 0) + 1,
              }));
            }
          }
        };

        socket.on("chat:message", handleMessage);
        
        cleanup = () => {
          socket?.off("chat:message", handleMessage);
        };
      } catch (err) {
        // Socket not available - that's fine
        console.warn("Socket not available for chat sidebar");
      }
    };

    if (user?.id) {
      setupSocketListener();
    }

    return cleanup;
  }, [user?.id, selectedConversationId]);

  const handleSelect = (conversation) => {
    const chatId = String(conversation._id || conversation.id);
    
    // Clear unread count
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });

    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const title = c.title || c.name || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="pl-sidebar">
        <div className="pl-sidebar-loading">
          <div className="pl-loading-spinner"></div>
          <span>Loading chats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pl-sidebar">
        <div className="pl-sidebar-error">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={fetchConversations}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-sidebar">
      {/* Search */}
      <div className="pl-search-wrapper">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-search-input"
        />
      </div>

      {/* New Chat Button */}
      <button className="pl-new-chat-btn" onClick={() => onSelectConversation?.({ _id: "new" })}>
        <span>+</span>
        <span>New Chat</span>
      </button>

      {/* Conversations List */}
      <div className="pl-conversations-list">
        {filteredConversations.length === 0 ? (
          <div className="pl-empty-state">
            <span className="pl-empty-icon">💬</span>
            <p>No conversations yet</p>
            <small>Start a new chat to connect!</small>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const convId = conv._id || conv.id;
            const isSelected = String(selectedConversationId) === String(convId);
            const unreadCount = unreadCounts[String(convId)] || 0;
            
            // Get display info
            const title = conv.title || conv.name || "Chat";
            const initials = title.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "CH";
            const lastMsg = conv.lastMessage;
            const lastMsgText = typeof lastMsg === "string" 
              ? lastMsg 
              : lastMsg?.text || "No messages yet";
            const lastMsgTime = conv.lastMessageAt || conv.updatedAt;

            return (
              <button
                key={convId}
                type="button"
                onClick={() => handleSelect(conv)}
                className={`pl-conversation-item ${isSelected ? "pl-conversation-item--selected" : ""}`}
              >
                {/* Avatar */}
                <div className="pl-conv-avatar">
                  {conv.avatarUrl ? (
                    <img src={conv.avatarUrl} alt={title} />
                  ) : (
                    <span>{initials}</span>
                  )}
                  {unreadCount > 0 && (
                    <div className="pl-unread-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="pl-conv-content">
                  <div className="pl-conv-header">
                    <span className={`pl-conv-name ${unreadCount > 0 ? "pl-conv-name--unread" : ""}`}>
                      {title}
                    </span>
                    {lastMsgTime && (
                      <span className="pl-conv-time">
                        {formatTime(lastMsgTime)}
                      </span>
                    )}
                  </div>
                  <div className={`pl-conv-preview ${unreadCount > 0 ? "pl-conv-preview--unread" : ""}`}>
                    {lastMsgText}
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

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
