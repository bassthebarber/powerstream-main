// frontend/src/pages/PowerLine/ChatWindow.jsx
// PowerLine Chat Window - Messenger Style Message Thread
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/api.js";
import "./PowerLine.css";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  // State
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // User info
  const userId = user?._id || user?.id;
  const displayName = user?.name || user?.displayName || "User";

  // Load conversation details
  const loadConversation = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      const res = await api.get(`/powerline/chats/${conversationId}`);
      if (res.data?.success || res.data?.ok) {
        setConversation(res.data.data || res.data.chat);
      }
    } catch (err) {
      console.warn("Load conversation error:", err);
    }
  }, [conversationId]);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      setError("");
      
      const res = await api.get(`/powerline/chats/${conversationId}/messages`);
      
      if (res.data?.success || res.data?.ok) {
        setMessages(res.data.data || res.data.messages || []);
      } else if (Array.isArray(res.data)) {
        setMessages(res.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn("Load messages error:", err);
      setError("Could not load messages");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversation();
    loadMessages();
  }, [loadConversation, loadMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversationId]);

  // Send message
  const handleSend = async (e) => {
    e?.preventDefault();
    
    if (!messageText.trim() || sending) return;
    
    const text = messageText.trim();
    setMessageText("");
    setSending(true);
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      text,
      sender: { _id: userId, name: displayName, avatarUrl: user?.avatarUrl },
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      const res = await api.post(`/powerline/chats/${conversationId}/messages`, {
        text,
      });
      
      if (res.data?.success || res.data?.ok) {
        const newMessage = res.data.data || res.data.message;
        // Replace temp message with real one
        setMessages(prev => 
          prev.map(m => m._id === tempId ? { ...newMessage, status: "sent" } : m)
        );
      } else {
        // Mark as failed
        setMessages(prev => 
          prev.map(m => m._id === tempId ? { ...m, status: "failed" } : m)
        );
      }
    } catch (err) {
      console.error("Send message error:", err);
      // Mark as failed
      setMessages(prev => 
        prev.map(m => m._id === tempId ? { ...m, status: "failed" } : m)
      );
    } finally {
      setSending(false);
    }
  };

  // Get other participant
  const otherParticipant = useMemo(() => {
    if (!conversation) return null;
    if (conversation.isGroup) {
      return { name: conversation.title || "Group Chat", avatarUrl: conversation.avatarUrl };
    }
    const other = conversation.participants?.find(p => 
      String(p._id || p.id) !== String(userId)
    );
    return other || { name: "Chat", avatarUrl: null };
  }, [conversation, userId]);

  // Get initials
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  // Format time for messages
  const formatMessageTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date separator
  const formatDateSeparator = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;
    
    messages.forEach(msg => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: "date", date: msg.createdAt });
      }
      groups.push({ type: "message", data: msg });
    });
    
    return groups;
  }, [messages]);

  // Check if message is from current user
  const isOwnMessage = (msg) => {
    const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
    return String(senderId) === String(userId);
  };

  // Retry failed message
  const retryMessage = async (msg) => {
    setMessages(prev => prev.filter(m => m._id !== msg._id));
    setMessageText(msg.text);
    inputRef.current?.focus();
  };

  return (
    <div className="pl-chat-window">
      {/* Chat Header */}
      <header className="pl-chat-header">
        <button 
          className="pl-back-btn"
          onClick={() => navigate("/powerline")}
        >
          ←
        </button>
        
        <div className="pl-chat-user" onClick={() => otherParticipant && navigate(`/profile/${otherParticipant._id || otherParticipant.id}`)}>
          <div className="pl-chat-avatar">
            {otherParticipant?.avatarUrl ? (
              <img src={otherParticipant.avatarUrl} alt="" />
            ) : (
              <span>{getInitials(otherParticipant?.name)}</span>
            )}
            <div className="pl-online-indicator"></div>
          </div>
          <div className="pl-chat-user-info">
            <div className="pl-chat-user-name">{otherParticipant?.name || "Chat"}</div>
            <div className="pl-chat-user-status">
              {isTyping ? "Typing..." : "Active now"}
            </div>
          </div>
        </div>
        
        <div className="pl-chat-actions">
          <button className="pl-icon-btn" title="Call">📞</button>
          <button className="pl-icon-btn" title="Video">📹</button>
          <button className="pl-icon-btn" title="Info">ℹ️</button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="pl-messages" ref={messagesContainerRef}>
        {loading ? (
          <div className="pl-loading">
            <div className="pl-spinner"></div>
            <span>Loading messages...</span>
          </div>
        ) : error ? (
          <div className="pl-error">
            <span>{error}</span>
            <button onClick={loadMessages} className="pl-retry-btn">Retry</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="pl-no-messages">
            <div className="pl-no-messages-avatar">
              {otherParticipant?.avatarUrl ? (
                <img src={otherParticipant.avatarUrl} alt="" />
              ) : (
                <span>{getInitials(otherParticipant?.name)}</span>
              )}
            </div>
            <h3>{otherParticipant?.name}</h3>
            <p>Start a conversation with {otherParticipant?.name?.split(" ")[0] || "this user"}</p>
          </div>
        ) : (
          <>
            {groupedMessages.map((item, idx) => {
              if (item.type === "date") {
                return (
                  <div key={`date-${idx}`} className="pl-date-separator">
                    <span>{formatDateSeparator(item.date)}</span>
                  </div>
                );
              }
              
              const msg = item.data;
              const isOwn = isOwnMessage(msg);
              const senderName = msg.sender?.name || "User";
              const senderAvatar = msg.sender?.avatarUrl;
              
              return (
                <div 
                  key={msg._id || idx}
                  className={`pl-message ${isOwn ? "pl-message--own" : "pl-message--other"}`}
                >
                  {/* Avatar for other's messages */}
                  {!isOwn && (
                    <div className="pl-message-avatar">
                      {senderAvatar ? (
                        <img src={senderAvatar} alt="" />
                      ) : (
                        <span>{getInitials(senderName)}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Message Content */}
                  <div className="pl-message-content">
                    <div className={`pl-message-bubble ${isOwn ? "pl-bubble--own" : "pl-bubble--other"}`}>
                      {msg.text}
                      
                      {/* Status indicator for own messages */}
                      {isOwn && msg.status && (
                        <span className={`pl-message-status pl-message-status--${msg.status}`}>
                          {msg.status === "sending" && "⏳"}
                          {msg.status === "sent" && "✓"}
                          {msg.status === "delivered" && "✓✓"}
                          {msg.status === "read" && "✓✓"}
                          {msg.status === "failed" && (
                            <button onClick={() => retryMessage(msg)} className="pl-retry-inline">
                              ⚠️ Retry
                            </button>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="pl-message-time">
                      {formatMessageTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="pl-typing-indicator">
            <div className="pl-typing-avatar">
              {otherParticipant?.avatarUrl ? (
                <img src={otherParticipant.avatarUrl} alt="" />
              ) : (
                <span>{getInitials(otherParticipant?.name)}</span>
              )}
            </div>
            <div className="pl-typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form className="pl-input-area" onSubmit={handleSend}>
        <button type="button" className="pl-input-btn" title="Add attachment">
          ➕
        </button>
        <button type="button" className="pl-input-btn" title="Add image">
          🖼️
        </button>
        <button type="button" className="pl-input-btn" title="Add GIF">
          GIF
        </button>
        
        <div className="pl-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder="Aa"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="pl-message-input"
            disabled={sending}
          />
          <button type="button" className="pl-emoji-btn" title="Emoji">
            😊
          </button>
        </div>
        
        {messageText.trim() ? (
          <button 
            type="submit" 
            className="pl-send-btn"
            disabled={sending}
          >
            {sending ? "..." : "➤"}
          </button>
        ) : (
          <button type="button" className="pl-input-btn pl-like-btn" title="Send like">
            👍
          </button>
        )}
      </form>
    </div>
  );
}

