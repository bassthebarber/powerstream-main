// frontend/src/components/ChatWindow.jsx
// PowerLine chat window with messages, reactions, typing indicators
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";

const REACTIONS = [
  { type: "like", emoji: "👍" },
  { type: "love", emoji: "❤️" },
  { type: "fire", emoji: "🔥" },
];

export default function ChatWindow({ conversationId, conversationInfo, onMarkRead }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeReactionPicker, setActiveReactionPicker] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  // User info
  const currentUserId = user?.id ? String(user.id) : null;
  const currentUserName = user?.name || user?.displayName || "You";

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId || conversationId === "new") return;
    
    try {
      setLoading(true);
      setError(null);
      
      // PowerLine V5 API - GET /api/powerline/threads/:threadId/messages
      const res = await api.get(`/powerline/threads/${conversationId}/messages?limit=50`);

      let msgs = [];
      if (res.data?.messages) {
        msgs = res.data.messages;
      } else if (res.data?.items) {
        msgs = res.data.items;
      } else if (Array.isArray(res.data)) {
        msgs = res.data;
      }
      
      // Sort oldest first
      msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(msgs);
      
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Could not load messages");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Setup socket
  const setupSocket = useCallback(async () => {
    if (!conversationId || conversationId === "new") return;

    try {
      const { getChatSocket } = await import("../lib/socket.js");
      const socket = getChatSocket();
      
      if (!socket) {
        console.warn("Socket not available for chat");
        return;
      }

      // Clean up previous listeners (V5 + legacy)
      if (socketRef.current) {
        socketRef.current.off("message:new");
        socketRef.current.off("typing:start");
        socketRef.current.off("typing:stop");
        socketRef.current.off("chat:message");
        socketRef.current.off("chat:typing");
        socketRef.current.off("chat:typing_stop");
        socketRef.current.off("chat:reaction");
        socketRef.current.off("chat:error");
      }

      socketRef.current = socket;

      // V5 socket events - Join thread
      socket.emit("join:thread", conversationId);
      // Legacy event (backwards compatibility)
      socket.emit("chat:join", conversationId);

      // Message handler for both V5 and legacy events
      const handleNewMessage = (message) => {
        setMessages((prev) => {
          const msgId = message._id || message.id;
          const exists = prev.some((m) => {
            const existingId = m._id || m.id;
            return existingId && msgId && String(existingId) === String(msgId);
          });
          if (exists) return prev;
          return [...prev, message];
        });

        if (onMarkRead) {
          onMarkRead(conversationId);
        }
      };

      // V5 message event
      socket.on("message:new", handleNewMessage);
      // Legacy message event
      socket.on("chat:message", handleNewMessage);

      // Typing handler for both V5 and legacy
      const handleTypingStart = (data) => {
        const { userId, userName } = data;
        if (String(userId) === currentUserId) return;

        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === userId)) return prev;
          return [...prev, { userId, userName: userName || "Someone" }];
        });

        // Auto-clear after 3s
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
        }, 3000);
      };

      const handleTypingStop = (data) => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      };

      // V5 typing events
      socket.on("typing:start", handleTypingStart);
      socket.on("typing:stop", handleTypingStop);
      // Legacy typing events
      socket.on("chat:typing", handleTypingStart);
      socket.on("chat:typing_stop", handleTypingStop);

      // Reaction updates
      socket.on("chat:reaction", (data) => {
        const { messageId, reactions } = data;
        setMessages((prev) =>
          prev.map((m) =>
            (m._id || m.id) === messageId ? { ...m, reactions } : m
          )
        );
      });

      socket.on("chat:error", (error) => {
        console.error("Chat socket error:", error);
      });

    } catch (err) {
      console.warn("Could not setup chat socket:", err);
    }
  }, [conversationId, currentUserId, onMarkRead]);

  // Fetch messages and setup socket when conversation changes
  useEffect(() => {
    if (conversationId && conversationId !== "new") {
      fetchMessages();
      setupSocket();
    } else {
      setMessages([]);
    }

    return () => {
      if (socketRef.current && conversationId) {
        // V5 leave event
        socketRef.current.emit("leave:thread", conversationId);
        // Legacy leave event
        socketRef.current.emit("chat:leave", conversationId);
        // Clean up V5 events
        socketRef.current.off("message:new");
        socketRef.current.off("typing:start");
        socketRef.current.off("typing:stop");
        // Clean up legacy events
        socketRef.current.off("chat:message");
        socketRef.current.off("chat:typing");
        socketRef.current.off("chat:typing_stop");
        socketRef.current.off("chat:reaction");
        socketRef.current.off("chat:error");
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, fetchMessages, setupSocket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Focus input when conversation selected
  useEffect(() => {
    if (conversationId && conversationId !== "new") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [conversationId]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!conversationId || !socketRef.current) return;

    // V5 typing event
    socketRef.current.emit("typing:start", { 
      threadId: conversationId,
      userName: currentUserName
    });
    // Legacy typing event
    socketRef.current.emit("chat:typing", { 
      chatId: conversationId,
      userName: currentUserName
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        // V5 stop event
        socketRef.current.emit("typing:stop", { threadId: conversationId });
        // Legacy stop event
        socketRef.current.emit("chat:typing_stop", { chatId: conversationId });
      }
    }, 2000);
  };

  // Send message
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !conversationId || !currentUserId) return;

    // Stop typing indicator
    if (socketRef.current) {
      // V5 stop event
      socketRef.current.emit("typing:stop", { threadId: conversationId });
      // Legacy stop event
      socketRef.current.emit("chat:typing_stop", { chatId: conversationId });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      text: messageText,
      author: currentUserId,
      createdAt: new Date().toISOString(),
      pending: true,
      reactions: [],
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const socket = socketRef.current;
      if (socket?.connected) {
        // V5 message event
        socket.emit("message:send", {
          threadId: conversationId,
          text: messageText,
        });
        // Legacy message event
        socket.emit("chat:message", {
          chatId: conversationId,
          text: messageText,
        });
      } else {
        // PowerLine V5 API - POST /api/powerline/threads/:threadId/messages
        const res = await api.post(`/powerline/threads/${conversationId}/messages`, {
          text: messageText,
        });

        if (res.data?.message) {
          setMessages((prev) => 
            prev.map((m) => m._id === tempId ? { ...res.data.message, pending: false } : m)
          );
        } else if (res.data) {
          setMessages((prev) => 
            prev.map((m) => m._id === tempId ? { ...res.data, pending: false } : m)
          );
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  // Add reaction to message
  const handleReaction = async (messageId, reactionType) => {
    if (!currentUserId) return;

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => {
        if ((m._id || m.id) !== messageId) return m;
        
        const reactions = [...(m.reactions || [])];
        const existingIdx = reactions.findIndex(
          (r) => String(r.user) === currentUserId
        );

        if (existingIdx >= 0) {
          if (reactions[existingIdx].type === reactionType) {
            reactions.splice(existingIdx, 1); // Toggle off
          } else {
            reactions[existingIdx] = { user: currentUserId, type: reactionType };
          }
        } else {
          reactions.push({ user: currentUserId, type: reactionType });
        }

        return { ...m, reactions };
      })
    );

    setActiveReactionPicker(null);

    // Send to backend - PowerLine V5 API
    try {
      await api.post(`/powerline/threads/${conversationId}/messages/${messageId}/reactions`, {
        emoji: reactionType,
      });
    } catch (err) {
      console.error("Error adding reaction:", err);
      // Refresh messages to get correct state
      fetchMessages();
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  };

  // Get avatar background color
  const getAvatarColor = (name) => {
    if (!name) return "#ffb84d";
    const colors = [
      "#ffb84d", "#ff6b6b", "#4ecdc4", "#45b7d1", 
      "#96c93d", "#dda15e", "#9b5de5", "#f72585"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Show placeholder for no conversation selected
  if (!conversationId) {
    return (
      <div className="pl-chat-empty">
        <div className="pl-chat-empty-content">
          <span className="pl-chat-empty-icon">💬</span>
          <h3>Select a conversation</h3>
          <p>Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  // New chat placeholder
  if (conversationId === "new") {
    return (
      <div className="pl-chat-empty">
        <div className="pl-chat-empty-content">
          <span className="pl-chat-empty-icon">✨</span>
          <h3>Start a new conversation</h3>
          <p>Search for a user to begin chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-chat-window">
      {/* Typing indicator banner */}
      {typingUsers.length > 0 && (
        <div className="pl-typing-banner">
          <span className="pl-typing-indicator">
            {typingUsers.length === 1
              ? `${typingUsers[0].userName} is typing...`
              : `${typingUsers.length} people typing...`}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="pl-messages-container" onClick={() => setActiveReactionPicker(null)}>
        {loading ? (
          <div className="pl-messages-loading">
            <div className="pl-loading-spinner"></div>
            <span>Loading messages...</span>
          </div>
        ) : error ? (
          <div className="pl-messages-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={fetchMessages}>Retry</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="pl-messages-empty">
            <span>👋</span>
            <p>No messages yet</p>
            <small>Send a message to start the conversation!</small>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const msgId = msg._id || msg.id;
            const authorId = msg.author?._id || msg.author;
            const isOwn = String(authorId) === currentUserId;
            const authorName = isOwn 
              ? currentUserName 
              : msg.authorName || msg.author?.name || msg.user?.name || "User";
            const authorAvatar = msg.user?.avatarUrl || msg.author?.avatarUrl;

            // Group consecutive messages from same author
            const prevMsg = messages[idx - 1];
            const prevAuthorId = prevMsg?.author?._id || prevMsg?.author;
            const showAvatar = !isOwn && String(prevAuthorId) !== String(authorId);

            // Reactions
            const reactions = msg.reactions || [];
            const reactionCounts = {};
            reactions.forEach((r) => {
              reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
            });
            const userReaction = reactions.find(
              (r) => String(r.user) === currentUserId
            )?.type;

            return (
              <div
                key={msgId}
                className={`pl-message ${isOwn ? "pl-message--own" : "pl-message--other"} ${msg.pending ? "pl-message--pending" : ""}`}
              >
                {/* Avatar for other's messages */}
                {!isOwn && (
                  <div className="pl-message-avatar-wrapper">
                    {showAvatar ? (
                      <div 
                        className="pl-message-avatar"
                        style={{ "--avatar-bg": getAvatarColor(authorName) }}
                      >
                        {authorAvatar ? (
                          <img src={authorAvatar} alt={authorName} />
                        ) : (
                          <span>{getInitials(authorName)}</span>
                        )}
                      </div>
                    ) : (
                      <div className="pl-message-avatar-spacer" />
                    )}
                  </div>
                )}

                <div className="pl-message-content">
                  {!isOwn && showAvatar && (
                    <div className="pl-message-author">{authorName}</div>
                  )}
                  
                  <div className="pl-message-bubble-wrapper">
                    <div className="pl-message-bubble">
                      <p>{msg.text}</p>
                      <span className="pl-message-time">
                        {msg.pending ? "Sending..." : formatTime(msg.createdAt)}
                      </span>
                    </div>

                    {/* Reaction picker toggle */}
                    <button
                      className="pl-reaction-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveReactionPicker(
                          activeReactionPicker === msgId ? null : msgId
                        );
                      }}
                    >
                      😊
                    </button>

                    {/* Reaction picker */}
                    {activeReactionPicker === msgId && (
                      <div className="pl-reaction-picker" onClick={(e) => e.stopPropagation()}>
                        {REACTIONS.map((r) => (
                          <button
                            key={r.type}
                            className={`pl-reaction-option ${userReaction === r.type ? "pl-reaction-option--selected" : ""}`}
                            onClick={() => handleReaction(msgId, r.type)}
                          >
                            {r.emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Display reactions */}
                  {Object.keys(reactionCounts).length > 0 && (
                    <div className="pl-message-reactions">
                      {Object.entries(reactionCounts).map(([type, count]) => {
                        const reactionEmoji = REACTIONS.find((r) => r.type === type)?.emoji;
                        return (
                          <span 
                            key={type} 
                            className={`pl-reaction-badge ${userReaction === type ? "pl-reaction-badge--mine" : ""}`}
                          >
                            {reactionEmoji} {count > 1 && count}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing indicator bubble */}
        {typingUsers.length > 0 && (
          <div className="pl-message pl-message--other pl-message--typing">
            <div className="pl-message-avatar-wrapper">
              <div className="pl-message-avatar" style={{ "--avatar-bg": "#555" }}>
                <span>...</span>
              </div>
            </div>
            <div className="pl-message-content">
              <div className="pl-message-bubble pl-typing-bubble">
                <span className="pl-typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Messenger Style */}
      <form className="pl-chat-input" onSubmit={handleSend}>
        <div className="pl-chat-input-actions">
          <button type="button" className="pl-chat-input-action" title="Attach file (coming soon)">
            📎
          </button>
          <button type="button" className="pl-chat-input-action" title="Send image (coming soon)">
            🖼️
          </button>
        </div>
        
        <div className="pl-chat-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (newMessage.trim() && !sending) {
                  handleSend(e);
                }
              }
            }}
            placeholder="Send a message…"
            disabled={sending}
            autoComplete="off"
          />
          <button type="button" className="pl-emoji-btn" title="Emoji">
            😊
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className={`pl-send-btn ${newMessage.trim() ? "pl-send-btn--active" : ""}`}
          title="Send message (Enter)"
        >
          {sending ? (
            <span className="pl-send-spinner">⏳</span>
          ) : (
            <span>➤</span>
          )}
        </button>
      </form>
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
