// frontend/src/pages/PowerLine/Conversations.jsx
// PowerLine Messenger - FB Messenger Style Conversations Sidebar
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/api.js";
import "./PowerLine.css";

export default function Conversations() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { user } = useAuth();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  
  // User info
  const userId = user?._id || user?.id;
  const displayName = user?.name || user?.displayName || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.avatarUrl;
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      const res = await api.get("/powerline/chats");
      
      if (res.data?.success || res.data?.ok) {
        setConversations(res.data.data || res.data.chats || []);
      } else if (Array.isArray(res.data)) {
        setConversations(res.data);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.warn("PowerLine load error:", err);
      // Don't show error for auth issues - just empty state
      if (err.response?.status === 401) {
        setConversations([]);
      } else {
        setError("Could not load conversations");
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Search users for new chat
  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }
    
    try {
      setSearchingUsers(true);
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      const results = res.data?.users || res.data?.data || [];
      // Filter out current user
      setUsers(results.filter(u => String(u._id || u.id) !== String(userId)));
    } catch (err) {
      console.warn("User search error:", err);
      setUsers([]);
    } finally {
      setSearchingUsers(false);
    }
  }, [userId]);

  // Start new conversation
  const startConversation = async (otherUserId) => {
    try {
      const res = await api.post("/powerline/chats", {
        participants: [otherUserId],
        isGroup: false,
      });
      
      if (res.data?.success || res.data?.ok) {
        const chatId = res.data.data?._id || res.data.chat?._id || res.data.data?.id;
        setShowNewChat(false);
        loadConversations();
        if (chatId) {
          navigate(`/powerline/chat/${chatId}`);
        }
      }
    } catch (err) {
      console.error("Start conversation error:", err);
    }
  };

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.title?.toLowerCase().includes(q) ||
      conv.participants?.some(p => p.name?.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Get other participant for display
  const getOtherParticipant = (conv) => {
    if (conv.isGroup) {
      return { name: conv.title || "Group Chat", avatarUrl: conv.avatarUrl };
    }
    const other = conv.participants?.find(p => String(p._id || p.id) !== String(userId));
    return other || { name: conv.title || "Chat", avatarUrl: null };
  };

  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="pl-container">
      {/* Left Sidebar - Conversations List */}
      <aside className="pl-sidebar">
        {/* Header */}
        <div className="pl-sidebar-header">
          <div className="pl-sidebar-header-top">
            <h1 className="pl-sidebar-title">Chats</h1>
            <div className="pl-sidebar-actions">
              <button 
                className="pl-icon-btn"
                onClick={() => setShowNewChat(!showNewChat)}
                title="New message"
              >
                ✏️
              </button>
              <button className="pl-icon-btn" title="Settings">⚙️</button>
            </div>
          </div>
          
          {/* Search */}
          <div className="pl-search">
            <span className="pl-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search Messenger"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-search-input"
            />
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="pl-new-chat">
            <div className="pl-new-chat-header">
              <h3>New Message</h3>
              <button onClick={() => setShowNewChat(false)}>×</button>
            </div>
            <input
              type="text"
              placeholder="Search people..."
              className="pl-new-chat-search"
              onChange={(e) => searchUsers(e.target.value)}
            />
            <div className="pl-new-chat-results">
              {searchingUsers ? (
                <div className="pl-loading-small">Searching...</div>
              ) : users.length > 0 ? (
                users.map(u => (
                  <div
                    key={u._id || u.id}
                    className="pl-user-item"
                    onClick={() => startConversation(u._id || u.id)}
                  >
                    <div className="pl-user-avatar">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" />
                      ) : (
                        <span>{getInitials(u.name)}</span>
                      )}
                    </div>
                    <div className="pl-user-info">
                      <div className="pl-user-name">{u.name}</div>
                      {u.email && <div className="pl-user-email">{u.email}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-new-chat-hint">
                  Type to search for people to message
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="pl-conversations-list">
          {loading ? (
            <div className="pl-loading">
              <div className="pl-spinner"></div>
              <span>Loading conversations...</span>
            </div>
          ) : error ? (
            <div className="pl-error">
              <span className="pl-error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={loadConversations} className="pl-retry-btn">
                Retry
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="pl-empty">
              <div className="pl-empty-icon">💬</div>
              <h3>No conversations yet</h3>
              <p>Start a conversation with someone!</p>
              <button 
                className="pl-start-chat-btn"
                onClick={() => setShowNewChat(true)}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = String(conv._id || conv.id) === String(conversationId);
              const lastMsgTime = conv.lastMessage?.createdAt || conv.updatedAt;
              const lastMsgPreview = conv.lastMessage?.text || "No messages yet";
              
              return (
                <div
                  key={conv._id || conv.id}
                  className={`pl-conversation-item ${isActive ? "pl-conversation-item--active" : ""}`}
                  onClick={() => navigate(`/powerline/chat/${conv._id || conv.id}`)}
                >
                  {/* Avatar */}
                  <div className="pl-conv-avatar">
                    {other.avatarUrl ? (
                      <img src={other.avatarUrl} alt="" />
                    ) : (
                      <span>{getInitials(other.name)}</span>
                    )}
                    {conv.isOnline && <div className="pl-online-dot"></div>}
                  </div>
                  
                  {/* Content */}
                  <div className="pl-conv-content">
                    <div className="pl-conv-header">
                      <span className="pl-conv-name">{other.name}</span>
                      <span className="pl-conv-time">{formatTime(lastMsgTime)}</span>
                    </div>
                    <div className="pl-conv-preview">
                      {lastMsgPreview.length > 40 
                        ? lastMsgPreview.slice(0, 37) + "..." 
                        : lastMsgPreview
                      }
                    </div>
                  </div>
                  
                  {/* Unread indicator */}
                  {conv.unreadCount > 0 && (
                    <div className="pl-unread-badge">{conv.unreadCount}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="pl-main">
        {conversationId ? (
          <Outlet />
        ) : (
          <div className="pl-welcome">
            <div className="pl-welcome-icon">💬</div>
            <h2>Welcome to PowerLine</h2>
            <p>Select a conversation or start a new one</p>
            <button 
              className="pl-start-chat-btn"
              onClick={() => setShowNewChat(true)}
            >
              ✏️ New Message
            </button>
          </div>
        )}
      </main>
    </div>
  );
}


