// frontend/src/components/powerline/MessageThread.jsx
// PowerLine V5 - Message Thread Component
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/api.js";

export default function MessageThread({ threadId, threadInfo }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  const currentUserId = user?.id ? String(user.id) : null;
  const currentUserName = user?.name || user?.displayName || "You";

  // Fetch messages - PowerLine V5 API
  const fetchMessages = useCallback(async () => {
    if (!threadId) return;

    try {
      setLoading(true);
      setError(null);
      
      // PowerLine V5 API - GET /api/powerline/threads/:threadId/messages
      const res = await api.get(`/powerline/threads/${threadId}/messages?limit=50`);

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
  }, [threadId]);

  // Setup socket connection - PowerLine V5 events
  const setupSocket = useCallback(async () => {
    if (!threadId) return;

    try {
      const { getChatSocket } = await import("../../lib/socket.js");
      const socket = getChatSocket();

      if (!socket) {
        console.warn("Socket not available for chat");
        return;
      }

      // Clean up previous listeners
      if (socketRef.current) {
        socketRef.current.off("message:new");
        socketRef.current.off("typing:start");
        socketRef.current.off("typing:stop");
        socketRef.current.off("chat:error");
        // Legacy events cleanup
        socketRef.current.off("chat:message");
        socketRef.current.off("chat:typing");
        socketRef.current.off("chat:typing_stop");
      }

      socketRef.current = socket;

      // V5 Socket Events - Join thread
      socket.emit("join:thread", threadId);
      // Also emit legacy event for backwards compatibility
      socket.emit("chat:join", threadId);

      // Listen for new messages (V5 event)
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
      };

      // Listen on both V5 and legacy events
      socket.on("message:new", handleNewMessage);
      socket.on("chat:message", handleNewMessage);

      // Typing indicators (V5)
      socket.on("typing:start", (data) => {
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

      socket.on("typing:stop", (data) => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      });

      // Legacy typing events
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
  }, [threadId, currentUserId]);

  // Fetch messages and setup socket when thread changes
  useEffect(() => {
    if (threadId) {
      fetchMessages();
      setupSocket();
    } else {
      setMessages([]);
    }

    return () => {
      if (socketRef.current && threadId) {
        // V5 leave events
        socketRef.current.emit("leave:thread", threadId);
        // Legacy leave
        socketRef.current.emit("chat:leave", threadId);
        
        socketRef.current.off("message:new");
        socketRef.current.off("typing:start");
        socketRef.current.off("typing:stop");
        socketRef.current.off("chat:message");
        socketRef.current.off("chat:typing");
        socketRef.current.off("chat:typing_stop");
        socketRef.current.off("chat:error");
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [threadId, fetchMessages, setupSocket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Focus input when thread selected
  useEffect(() => {
    if (threadId) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [threadId]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!threadId || !socketRef.current) return;

    // V5 typing event
    socketRef.current.emit("typing:start", { 
      threadId,
      userName: currentUserName 
    });
    // Legacy typing event
    socketRef.current.emit("chat:typing", { 
      chatId: threadId,
      userName: currentUserName 
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("typing:stop", { threadId });
        socketRef.current.emit("chat:typing_stop", { chatId: threadId });
      }
    }, 2000);
  };

  // Send message - PowerLine V5 API
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !threadId || !currentUserId) return;

    // Stop typing indicator
    if (socketRef.current) {
      socketRef.current.emit("typing:stop", { threadId });
      socketRef.current.emit("chat:typing_stop", { chatId: threadId });
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
      sender: currentUserId,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const socket = socketRef.current;
      if (socket?.connected) {
        // V5 socket event
        socket.emit("message:send", {
          threadId,
          text: messageText,
        });
        // Legacy socket event
        socket.emit("chat:message", {
          chatId: threadId,
          text: messageText,
        });
      } else {
        // Fallback to REST API - PowerLine V5
        const res = await api.post(`/powerline/threads/${threadId}/messages`, {
          text: messageText,
        });

        const newMsg = res.data?.message || res.data;
        if (newMsg) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? { ...newMsg, pending: false } : m))
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

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  };

  // Get avatar color from name
  const getAvatarColor = (name) => {
    if (!name) return "#ffb84d";
    const colors = ["#ffb84d", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96c93d", "#dda15e", "#9b5de5", "#f72585"];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // No thread selected
  if (!threadId) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          textAlign: "center",
          padding: 40,
        }}
      >
        <span style={{ fontSize: 48, marginBottom: 16 }}>💬</span>
        <h3 style={{ margin: "0 0 8px", color: "#fff" }}>Select a conversation</h3>
        <p style={{ margin: 0, fontSize: 14 }}>Choose a chat from the sidebar to start messaging</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0a0a0a",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          background: "#111",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), #e6a000)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#000",
          }}
        >
          {threadInfo?.avatarUrl ? (
            <img 
              src={threadInfo.avatarUrl} 
              alt=""
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            getInitials(threadInfo?.title || threadInfo?.name || "Chat")
          )}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", color: "#fff" }}>
            {threadInfo?.title || threadInfo?.name || "Conversation"}
          </h3>
          {typingUsers.length > 0 ? (
            <span style={{ fontSize: 12, color: "var(--gold)" }}>
              {typingUsers.length === 1 
                ? `${typingUsers[0].userName} is typing...` 
                : `${typingUsers.length} people typing...`}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "#4ade80" }}>Online</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 48 }}>
            <div style={{ 
              width: 32, height: 32, 
              border: "3px solid rgba(255,255,255,0.1)", 
              borderTop: "3px solid var(--gold)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 12px"
            }} />
            Loading messages...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "#ff6b6b", marginTop: 48 }}>
            <p>{error}</p>
            <button onClick={fetchMessages} style={{
              marginTop: 8, padding: "8px 16px", background: "var(--gold)",
              color: "#000", border: "none", borderRadius: 8, cursor: "pointer"
            }}>
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 48 }}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>👋</span>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const senderId = msg.sender?._id || msg.sender || msg.author?._id || msg.author;
            const isOwn = String(senderId) === currentUserId;
            const senderName = isOwn 
              ? currentUserName 
              : msg.sender?.name || msg.author?.name || "User";

            // Show avatar for first message in a block from same sender
            const prevMsg = messages[idx - 1];
            const prevSenderId = prevMsg?.sender?._id || prevMsg?.sender || prevMsg?.author?._id || prevMsg?.author;
            const showAvatar = !isOwn && String(prevSenderId) !== String(senderId);

            return (
              <div
                key={msg._id || msg.id || idx}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  alignSelf: isOwn ? "flex-end" : "flex-start",
                  maxWidth: "75%",
                  opacity: msg.pending ? 0.6 : 1,
                }}
              >
                {/* Avatar for other's messages */}
                {!isOwn && (
                  <div style={{ width: 28, flexShrink: 0 }}>
                    {showAvatar && (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: getAvatarColor(senderName),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#000",
                        }}
                      >
                        {getInitials(senderName)}
                      </div>
                    )}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isOwn 
                      ? "linear-gradient(135deg, var(--gold), #e6a000)" 
                      : "rgba(255,255,255,0.1)",
                    color: isOwn ? "#000" : "#fff",
                  }}
                >
                  {!isOwn && showAvatar && (
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, opacity: 0.8 }}>
                      {senderName}
                    </div>
                  )}
                  <div style={{ fontSize: 14, wordBreak: "break-word" }}>{msg.text}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, textAlign: "right", marginTop: 4 }}>
                    {msg.pending ? "Sending..." : formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {typingUsers.length > 0 && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, alignSelf: "flex-start" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#555",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#fff",
              }}
            >
              ...
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "18px 18px 18px 4px",
                background: "rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ animation: "bounce 1.4s infinite ease-in-out", animationDelay: "0s" }}>•</span>
                <span style={{ animation: "bounce 1.4s infinite ease-in-out", animationDelay: "0.2s" }}>•</span>
                <span style={{ animation: "bounce 1.4s infinite ease-in-out", animationDelay: "0.4s" }}>•</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          padding: 12,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "#111",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && newMessage.trim() && !sending) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Send a message…"
          disabled={sending}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#0a0a0a",
            color: "#fff",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            background: newMessage.trim() 
              ? "linear-gradient(135deg, var(--gold), #e6a000)" 
              : "rgba(255,255,255,0.1)",
            color: newMessage.trim() ? "#000" : "#666",
            fontWeight: 700,
            cursor: newMessage.trim() ? "pointer" : "not-allowed",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          {sending ? "⏳" : "➤"}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
