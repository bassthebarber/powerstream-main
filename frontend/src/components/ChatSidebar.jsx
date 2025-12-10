// frontend/src/components/ChatSidebar.jsx
// PowerLine conversation list sidebar with new chat modal
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";

export default function ChatSidebar({ onSelectConversation, selectedConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let convs = [];
      
      // PowerLine V5 API - GET /api/powerline/threads
      const res = await api.get(`/powerline/threads`);
      if (res.data?.threads) {
        convs = res.data.threads;
      } else if (res.data?.items) {
        convs = res.data.items;
      } else if (Array.isArray(res.data)) {
        convs = res.data;
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

  // Socket for real-time updates
  useEffect(() => {
    let socket = null;
    let cleanup = () => {};

    const setupSocketListener = async () => {
      try {
        const { getChatSocket } = await import("../lib/socket.js");
        socket = getChatSocket();
        
        if (!socket) return;

        const handleMessage = (message) => {
          const chatId = String(message.chat || message.conversation || message.threadId);
          if (chatId && chatId !== String(selectedConversationId)) {
            setUnreadCounts((prev) => ({
              ...prev,
              [chatId]: (prev[chatId] || 0) + 1,
            }));
          }
          // Refresh conversations to update last message
          fetchConversations();
        };

        // V5 socket events
        socket.on("message:new", handleMessage);
        // Legacy events (backwards compatibility)
        socket.on("chat:message", handleMessage);
        
        cleanup = () => {
          socket?.off("message:new", handleMessage);
          socket?.off("chat:message", handleMessage);
        };
      } catch (err) {
        console.warn("Socket not available for chat sidebar");
      }
    };

    if (user?.id) {
      setupSocketListener();
    }

    return cleanup;
  }, [user?.id, selectedConversationId, fetchConversations]);

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

  // Search users for new chat
  const handleUserSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}&limit=20`);
      setSearchResults(res.data?.users || []);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced user search
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUserSearch(userSearchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearchQuery, handleUserSearch]);

  // Create or get existing conversation
  const handleStartChat = async (targetUser) => {
    if (!user?.id || !targetUser?._id) return;
    
    try {
      setCreatingChat(true);
      
      // PowerLine V5 API - POST /api/powerline/threads
      const res = await api.post("/powerline/threads", {
        participantId: targetUser._id,
        isGroup: false,
      });

      const newChat = res.data?.thread || res.data;
      
      // Add user info for display
      const chatWithInfo = {
        ...newChat,
        name: targetUser.name,
        avatarUrl: targetUser.avatarUrl,
        otherUser: targetUser,
      };

      setShowNewChatModal(false);
      setUserSearchQuery("");
      setSearchResults([]);
      
      // Refresh conversations and select the new one
      await fetchConversations();
      onSelectConversation?.(chatWithInfo);
      
    } catch (err) {
      console.error("Error creating chat:", err);
      alert("Could not start conversation. Please try again.");
    } finally {
      setCreatingChat(false);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const title = c.title || c.name || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  };

  // Get avatar background color from name
  const getAvatarColor = (name) => {
    if (!name) return "#ffb84d";
    const colors = [
      "#ffb84d", "#ff6b6b", "#4ecdc4", "#45b7d1", 
      "#96c93d", "#dda15e", "#9b5de5", "#f72585"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

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
      <button 
        className="pl-new-chat-btn" 
        onClick={() => setShowNewChatModal(true)}
      >
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
            
            const displayName = conv.name || conv.title || getConversationName(conv, user?.id);
            const initials = getInitials(displayName);
            const avatarUrl = conv.avatarUrl || conv.otherUser?.avatarUrl || null;
            const avatarColor = getAvatarColor(displayName);
            
            const lastMsg = conv.lastMessage;
            const lastMsgText = typeof lastMsg === "string" 
              ? lastMsg 
              : lastMsg?.text || "Start a conversation";
            const lastMsgTime = conv.lastMessageAt || conv.updatedAt;

            return (
              <button
                key={convId}
                type="button"
                onClick={() => handleSelect(conv)}
                className={`pl-conversation-item ${isSelected ? "pl-conversation-item--selected" : ""}`}
              >
                {/* Avatar */}
                <div className="pl-conv-avatar" style={{ "--avatar-bg": avatarColor }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} />
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
                      {displayName}
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

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="pl-modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="pl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h3>New Message</h3>
              <button 
                className="pl-modal-close" 
                onClick={() => setShowNewChatModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="pl-modal-body">
              <div className="pl-user-search-wrapper">
                <span className="pl-user-search-label">To:</span>
                <input
                  type="text"
                  placeholder="Search for a user..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-user-search-input"
                  autoFocus
                />
              </div>

              <div className="pl-user-results">
                {searchLoading ? (
                  <div className="pl-user-results-loading">
                    <div className="pl-loading-spinner"></div>
                    <span>Searching...</span>
                  </div>
                ) : userSearchQuery.trim() && searchResults.length === 0 ? (
                  <div className="pl-user-results-empty">
                    <p>No users found</p>
                  </div>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u._id}
                      className="pl-user-result-item"
                      onClick={() => handleStartChat(u)}
                      disabled={creatingChat}
                    >
                      <div 
                        className="pl-user-result-avatar" 
                        style={{ "--avatar-bg": getAvatarColor(u.name) }}
                      >
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} />
                        ) : (
                          <span>{getInitials(u.name)}</span>
                        )}
                      </div>
                      <div className="pl-user-result-info">
                        <span className="pl-user-result-name">{u.name}</span>
                        <span className="pl-user-result-email">{u.email}</span>
                      </div>
                    </button>
                  ))
                )}
                
                {!userSearchQuery.trim() && (
                  <div className="pl-user-results-hint">
                    <span>🔍</span>
                    <p>Type a name or email to find someone</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getConversationName(conv, currentUserId) {
  if (conv.isGroup && conv.title) {
    return conv.title;
  }
  
  const participants = conv.participants || [];
  const otherParticipant = participants.find(
    (p) => String(p._id || p.id || p) !== String(currentUserId)
  );
  
  if (otherParticipant) {
    return otherParticipant.displayName || otherParticipant.name || otherParticipant.email || "User";
  }
  
  return "Chat";
}
