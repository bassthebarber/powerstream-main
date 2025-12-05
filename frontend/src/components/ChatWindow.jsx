// frontend/src/components/ChatWindow.jsx
// PowerLine chat window with messages and input
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";

export default function ChatWindow({ conversationId, onMarkRead }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
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
      
      let res;
      try {
        res = await api.get(`/chat/${conversationId}/messages?limit=50`);
      } catch {
        try {
          res = await api.get(`/powerline/messages/${conversationId}?limit=50`);
        } catch {
          // No messages endpoint available
          setMessages([]);
          return;
        }
      }

      let msgs = [];
      if (res.data?.items) {
        msgs = res.data.items;
      } else if (res.data?.messages) {
        msgs = res.data.messages;
      } else if (Array.isArray(res.data)) {
        msgs = res.data;
      }
      
      // Sort by date (oldest first)
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

      // Clean up previous listeners
      if (socketRef.current) {
        socketRef.current.off("chat:message");
        socketRef.current.off("chat:typing");
        socketRef.current.off("chat:typing_stop");
        socketRef.current.off("chat:error");
      }

      socketRef.current = socket;

      // Join chat room
      socket.emit("chat:join", conversationId);

      // Listen for new messages
      socket.on("chat:message", (message) => {
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
      });

      // Typing indicators
      socket.on("chat:typing", (data) => {
        const { userId, userName } = data;
        if (String(userId) === currentUserId) return;

        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === userId)) return prev;
          return [...prev, { userId, userName: userName || "Someone" }];
        });

        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
        }, 3000);
      });

      socket.on("chat:typing_stop", (data) => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
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
        socketRef.current.emit("chat:leave", conversationId);
        socketRef.current.off("chat:message");
        socketRef.current.off("chat:typing");
        socketRef.current.off("chat:typing_stop");
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

  // Handle typing indicator
  const handleTyping = () => {
    if (!conversationId || !socketRef.current) return;

    socketRef.current.emit("chat:typing", { 
      chatId: conversationId,
      userName: currentUserName
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("chat:typing_stop", { chatId: conversationId });
      }
    }, 2000);
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !currentUserId) return;

    // Stop typing indicator
    if (socketRef.current) {
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
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // Try socket first
      const socket = socketRef.current;
      if (socket?.connected) {
        socket.emit("chat:message", {
          chatId: conversationId,
          text: messageText,
        });
      } else {
        // Fallback to REST API
        const res = await api.post(`/chat/${conversationId}/messages`, {
          author: currentUserId,
          text: messageText,
        }).catch(() => {
          return api.post(`/powerline/messages/${conversationId}`, {
            author: currentUserId,
            text: messageText,
          });
        });

        if (res.data) {
          // Replace optimistic message with real one
          setMessages((prev) => 
            prev.map((m) => m._id === tempId ? { ...res.data, pending: false } : m)
          );
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
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
      {/* Header */}
      <div className="pl-chat-header">
        <div className="pl-chat-header-info">
          <h3>Conversation</h3>
          {typingUsers.length > 0 && (
            <span className="pl-typing-indicator">
              {typingUsers.length === 1
                ? `${typingUsers[0].userName} is typing...`
                : `${typingUsers.length} people typing...`}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="pl-messages-container">
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
          messages.map((msg) => {
            const msgId = msg._id || msg.id;
            const isOwn = String(msg.author) === currentUserId;
            const authorName = isOwn 
              ? currentUserName 
              : msg.authorName || msg.user?.name || "User";

            return (
              <div
                key={msgId}
                className={`pl-message ${isOwn ? "pl-message--own" : "pl-message--other"} ${msg.pending ? "pl-message--pending" : ""}`}
              >
                {/* Avatar for other's messages */}
                {!isOwn && (
                  <div className="pl-message-avatar">
                    {msg.user?.avatarUrl ? (
                      <img src={msg.user.avatarUrl} alt={authorName} />
                    ) : (
                      <span>{authorName[0]?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                )}

                <div className="pl-message-content">
                  {!isOwn && (
                    <div className="pl-message-author">{authorName}</div>
                  )}
                  <div className="pl-message-bubble">
                    <p>{msg.text}</p>
                    <span className="pl-message-time">
                      {msg.pending ? "Sending..." : formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing indicator bubble */}
        {typingUsers.length > 0 && (
          <div className="pl-message pl-message--other">
            <div className="pl-message-avatar">
              <span>...</span>
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

      {/* Input */}
      <form className="pl-chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="pl-send-btn"
        >
          {sending ? "..." : "Send"}
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
