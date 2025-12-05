import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/api.js";
import { getChatSocket, disconnectChatSocket } from "../../lib/socket.js";

export default function MessageThread({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const { user } = useAuth();

  // Fetch initial messages and set up socket
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      setupSocket();
    }

    return () => {
      // Cleanup on unmount or conversation change
      if (socketRef.current && conversationId) {
        socketRef.current.emit("chat:leave", conversationId);
        socketRef.current.off("chat:message");
        socketRef.current.off("chat:error");
      }
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setupSocket = () => {
    if (!conversationId) return;

    const socket = getChatSocket();
    if (!socket) {
      console.warn("Socket not available");
      return;
    }

    // Clean up previous listeners if any
    if (socketRef.current) {
      socketRef.current.off("chat:message");
      socketRef.current.off("chat:error");
    }

    socketRef.current = socket;

    // Join chat room
    socket.emit("chat:join", conversationId);

    // Listen for new messages
    const handleMessage = (message) => {
      // Prevent duplicates by checking if message already exists
      setMessages((prev) => {
        const exists = prev.some((m) => {
          const msgId = m._id || m.id;
          const newMsgId = message._id || message.id;
          return msgId && newMsgId && String(msgId) === String(newMsgId);
        });
        if (exists) return prev;
        return [...prev, message];
      });
    };

    socket.on("chat:message", handleMessage);

    socket.on("chat:error", (error) => {
      console.error("Chat socket error:", error);
    });
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      // Try /api/chat endpoint first, fallback to /powerline
      let res;
      try {
        res = await api.get(`/chat/${conversationId}/messages?limit=50`);
      } catch {
        res = await api.get(`/powerline/messages/${conversationId}?limit=50`);
      }
      
      if (res.data?.items) {
        // Reverse to show oldest first
        setMessages(res.data.items.reverse());
      } else if (Array.isArray(res.data)) {
        setMessages(res.data.reverse());
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !user?.id) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    const socket = socketRef.current || getChatSocket();
    if (socket && socket.connected) {
      // Send via socket (will persist server-side)
      socket.emit("chat:message", {
        chatId: conversationId,
        text: messageText,
      });
    } else {
      // Fallback to REST API if socket not available
      try {
        const res = await api.post(`/chat/${conversationId}/messages`, {
          author: String(user.id),
          text: messageText,
        }).catch(() => {
          return api.post(`/powerline/messages/${conversationId}`, {
            author: String(user.id),
            text: messageText,
          });
        });

        if (res.data) {
          setMessages((prev) => {
            const exists = prev.some((m) => m._id === res.data._id || m.id === res.data._id);
            if (exists) return prev;
            return [...prev, res.data];
          });
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setNewMessage(messageText); // Restore message on error
      }
    }
  };

  if (!conversationId) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: 14,
        }}
      >
        Select a conversation to start messaging
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
          padding: 16,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          background: "#111",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--gold)" }}>Conversation</h3>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 48 }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)", marginTop: 48 }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = String(msg.author) === String(user?.id);
            return (
              <div
                key={msg._id || msg.id}
                style={{
                  alignSelf: isOwn ? "flex-end" : "flex-start",
                  maxWidth: "70%",
                  padding: "10px 14px",
                  borderRadius: 16,
                  background: isOwn ? "var(--gold)" : "rgba(255,255,255,0.1)",
                  color: isOwn ? "#000" : "#fff",
                }}
              >
                <div style={{ fontSize: 14, marginBottom: 4 }}>{msg.text}</div>
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.7,
                    textAlign: "right",
                  }}
                >
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "now"}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          padding: 16,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "#111",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#0a0a0a",
            color: "#fff",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          style={{
            padding: "10px 24px",
            borderRadius: 20,
            border: "none",
            background: newMessage.trim() ? "var(--gold)" : "#666",
            color: "#000",
            fontWeight: 700,
            cursor: newMessage.trim() ? "pointer" : "not-allowed",
            fontSize: 14,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
