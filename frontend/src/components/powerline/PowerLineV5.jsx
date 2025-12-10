// frontend/src/components/powerline/PowerLineV5.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import MobileHeader from "./MobileHeader";
import MobileChatListDrawer from "./MobileChatListDrawer";
import PowerLineAPI from "../../api/powerlineApi";
import { useAuth } from "../../context/AuthContext";
import "./PowerLineV5.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
const POWERLINE_BASE = `${API_BASE}/powerline`;
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5001";

let socket;

/**
 * Try to grab a JWT from localStorage.
 * Adjust the keys here if your token is stored under a different name.
 */
function getAuthToken() {
  return (
    localStorage.getItem("powerstreamToken") ||
    localStorage.getItem("powerstream_token") ||
    localStorage.getItem("ps_jwt") ||
    localStorage.getItem("ps_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

async function apiGet(path) {
  const token = getAuthToken();
  const res = await fetch(`${POWERLINE_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  // Handle unauthenticated gracefully
  if (res.status === 401) {
    return { ok: true, threads: [], data: [], messages: [] };
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `GET ${path} failed with ${res.status}`);
  }
  return res.json();
}

async function apiPost(path, body) {
  const token = getAuthToken();
  const res = await fetch(`${POWERLINE_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(body || {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${path} failed with ${res.status}`);
  }
  return res.json();
}

export default function PowerLineV5() {
  const { user } = useAuth();
  
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [threadsError, setThreadsError] = useState("");

  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");

  const [composerText, setComposerText] = useState("");
  const [sending, setSending] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState("connecting"); // "connected" | "error" | "connecting"
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");

  const messagesEndRef = useRef(null);
  const activeThreadRef = useRef(null);
  const meIdRef = useRef(
    localStorage.getItem("ps_user_id") || localStorage.getItem("userId") || ""
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keep activeThreadRef in sync
  useEffect(() => {
    activeThreadRef.current = activeThread;
  }, [activeThread]);

  // Scroll messages to bottom when they change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadThreads = useCallback(async () => {
    try {
      setThreadsLoading(true);
      setThreadsError("");
      const data = await apiGet("/threads");
      const items = data?.data || data?.threads || data?.items || [];
      setThreads(items);
      // Clear any previous error
      setThreadsError("");
    } catch (err) {
      // Don't show error for unauthenticated users - just show empty state
      const token = getAuthToken();
      if (!token) {
        setThreads([]);
        setThreadsError(""); // No error message for logged out users
      } else {
        console.warn("PowerLine threads:", err.message);
        setThreadsError("Could not load conversations");
      }
    } finally {
      setThreadsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (thread) => {
    if (!thread) return;
    try {
      setMessagesLoading(true);
      setMessagesError("");
      const threadId = thread._id || thread.id;
      const data = await apiGet(`/threads/${threadId}/messages`);
      const items = data?.data || data?.messages || data?.items || [];
      setMessages(items);
    } catch (err) {
      console.error("PowerLine messages error:", err);
      setMessagesError("Could not load messages");
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Socket.IO connection setup
  useEffect(() => {
    const token = getAuthToken();
    
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: token ? { token } : undefined,
    });

    socket.on("connect", () => {
      console.log("[PowerLine] Socket connected:", socket.id);
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      console.log("[PowerLine] Socket disconnected");
      setConnectionStatus("error");
    });

    socket.on("connect_error", (err) => {
      console.error("[PowerLine] Socket connect error:", err.message);
      setConnectionStatus("error");
    });

    // Real-time message received
    socket.on("message:new", (msg) => {
      console.log("[PowerLine] message:new received:", msg);
      const currentThread = activeThreadRef.current;
      const msgThreadId = msg.threadId || msg.conversationId || msg.conversation;
      const activeId = currentThread?._id || currentThread?.id;
      
      if (currentThread && msgThreadId === activeId) {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some(m => (m._id || m.id) === (msg._id || msg.id));
          if (exists) return prev;
          return [...prev, msg];
        });
      }
      // Refresh thread list to update previews
      loadThreads();
    });

    // Thread updated (new message preview, etc.)
    socket.on("thread:updated", (data) => {
      console.log("[PowerLine] thread:updated received:", data);
      loadThreads();
    });

    // New thread created
    socket.on("thread:new", (data) => {
      console.log("[PowerLine] thread:new received:", data);
      loadThreads();
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [loadThreads]);

  // Join/leave thread rooms when active thread changes
  useEffect(() => {
    if (!socket || !socket.connected) return;
    
    const threadId = activeThread?._id || activeThread?.id;
    if (threadId) {
      socket.emit("joinThread", threadId);
      console.log("[PowerLine] Joined thread room:", threadId);
    }

    return () => {
      if (threadId && socket?.connected) {
        socket.emit("leaveThread", threadId);
        console.log("[PowerLine] Left thread room:", threadId);
      }
    };
  }, [activeThread]);

  // Initial load
  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const handleSelectThread = async (thread) => {
    setActiveThread(thread);
    await loadMessages(thread);
  };

  const handleSendMessage = async () => {
    if (!activeThread || !composerText.trim()) return;
    try {
      setSending(true);
      const payload = { text: composerText.trim() };
      const threadId = activeThread._id || activeThread.id;
      const result = await apiPost(`/threads/${threadId}/messages`, payload);
      const saved = result?.data || result;

      // Optimistic add (avoid duplicate if socket already added it)
      setMessages((prev) => {
        const exists = prev.some(m => (m._id || m.id) === (saved._id || saved.id));
        if (exists) return prev;
        return [...prev, { ...saved, fromSelf: true }];
      });
      setComposerText("");

      // Refresh threads for last message preview / unread counts
      loadThreads();
    } catch (err) {
      console.error("Send message failed:", err);
      setMessagesError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const me = user?.email;
      const other = prompt("Enter email of person you want to chat with:");
      if (!other) return;
      
      const body = {
        participants: [me, other].filter(Boolean)
      };
      
      const res = await PowerLineAPI.createConversation(body);
      
      if (res.data?.conversation || res.data?.data || res.data?.chat) {
        const conversation = res.data.conversation || res.data.data || res.data.chat;
        setActiveThread(conversation);
        setNewChatModalOpen(false);
        await loadThreads();
        await loadMessages(conversation);
      } else {
        console.error("Conversation response missing:", res.data);
        alert("Could not create chat");
      }
    } catch (err) {
      console.error("Create chat failed:", err);
      alert("Could not create chat");
    }
  };

  const renderStatusPill = () => {
    const isConnected = connectionStatus === "connected";
    const isConnecting = connectionStatus === "connecting";
    return (
      <div
        className={`pl-v5-status-pill ${
          isConnected ? "pl-v5-status-ok" : "pl-v5-status-error"
        }`}
      >
        <span className="pl-v5-status-dot" />
        {isConnecting ? "Connecting…" : isConnected ? "Connected" : "Offline"}
      </div>
    );
  };

  const renderThreadItem = (thread) => {
    const isActive =
      activeThread && (activeThread._id || activeThread.id) === (thread._id || thread.id);

    const participants = thread.participants || [];
    const other =
      participants.find((p) => p._id !== meIdRef.current) || participants[0];

    const title =
      thread.title ||
      other?.displayName ||
      other?.name ||
      other?.email ||
      "Conversation";

    const lastPreview =
      thread.lastMessage?.text ||
      thread.lastMessagePreview ||
      "No messages yet";

    const unread = thread.unreadCount || 0;

    return (
      <button
        key={thread._id || thread.id}
        className={`pl-v5-thread-item ${isActive ? "pl-v5-thread-active" : ""}`}
        onClick={() => handleSelectThread(thread)}
      >
        <div className="pl-v5-thread-avatar">
          <span className="pl-v5-thread-avatar-initial">
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="pl-v5-thread-meta">
          <div className="pl-v5-thread-title-row">
            <span className="pl-v5-thread-title">{title}</span>
            {unread > 0 && (
              <span className="pl-v5-thread-unread">{unread}</span>
            )}
          </div>
          <div className="pl-v5-thread-preview">{lastPreview}</div>
        </div>
      </button>
    );
  };

  const renderMessage = (msg) => {
    const sender = msg.sender || msg.author || msg.user || {};
    const meId = meIdRef.current;
    const isOwn =
      msg.fromSelf ||
      (meId &&
        (sender._id === meId ||
          sender.id === meId ||
          sender.userId === meId ||
          String(sender) === meId));

    const text = msg.text || msg.body || msg.content || "";
    const timestamp = msg.createdAt || msg.timestamp;
    const timeLabel = timestamp
      ? new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <div
        key={msg._id || msg.id}
        className={`pl-v5-message-row ${
          isOwn ? "pl-v5-message-row-own" : "pl-v5-message-row-other"
        }`}
      >
        {!isOwn && (
          <div className="pl-v5-message-avatar">
            <span className="pl-v5-message-avatar-initial">
              {(sender.displayName || sender.name || "U").charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="pl-v5-message-bubble-wrapper">
          <div
            className={`pl-v5-message-bubble ${
              isOwn ? "pl-v5-message-bubble-own" : "pl-v5-message-bubble-other"
            }`}
          >
            <div className="pl-v5-message-text">{text}</div>
            <div className="pl-v5-message-meta">{timeLabel}</div>
          </div>
        </div>
        {isOwn && (
          <div className="pl-v5-message-spacer" />
        )}
      </div>
    );
  };

  // Mobile chat view renderer
  const renderMobileView = () => (
    <div className="pl-v5 pl-v5-mobile">
      {!activeThread ? (
        <>
          {/* Mobile header when no chat selected */}
          <div className="pl-v5-top">
            <div>
              <div className="pl-v5-title">PowerLine</div>
              <div className="pl-v5-subtitle">Real-time messaging</div>
            </div>
            <div className="pl-v5-top-right">
              {renderStatusPill()}
              <button
                className="pl-v5-newchat-btn"
                onClick={() => setNewChatModalOpen(true)}
              >
                +
              </button>
            </div>
          </div>

          {/* Thread list for mobile */}
          <div className="pl-v5-mobile-thread-list">
            {threadsLoading && (
              <div className="pl-v5-empty">Loading conversations…</div>
            )}
            {!threadsLoading && threadsError && (
              <div className="pl-v5-error">{threadsError}</div>
            )}
            {!threadsLoading && !threadsError && threads.length === 0 && (
              <div className="pl-v5-empty">
                <div>No conversations yet</div>
                <div className="pl-v5-empty-sub">Tap + to start one.</div>
              </div>
            )}
            {!threadsLoading && !threadsError && threads.length > 0 && (
              <div className="pl-v5-thread-list">
                {threads.map(renderThreadItem)}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Mobile header with back button */}
          <MobileHeader
            onBack={() => setActiveThread(null)}
            user={{
              name: activeThread.title || "Conversation",
              avatar: activeThread.avatar || null,
            }}
          />

          {/* Messages */}
          <div className="pl-v5-messages pl-v5-messages-mobile">
            {messagesLoading && (
              <div className="pl-v5-empty">Loading messages…</div>
            )}
            {!messagesLoading && messagesError && (
              <div className="pl-v5-error">{messagesError}</div>
            )}
            {!messagesLoading && !messagesError && messages.length === 0 && (
              <div className="pl-v5-empty">
                No messages yet. Say something to start the thread.
              </div>
            )}
            {!messagesLoading && !messagesError && messages.length > 0 && (
              <>
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Composer */}
          <div className="pl-v5-composer">
            <textarea
              className="pl-v5-composer-input"
              placeholder="Type a message…"
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              className="pl-v5-send-btn"
              onClick={handleSendMessage}
              disabled={!composerText.trim() || sending}
            >
              {sending ? "…" : "➤"}
            </button>
          </div>
        </>
      )}

      {/* Mobile drawer (optional overlay) */}
      {drawerOpen && (
        <>
          <div
            className="pl-mobile-backdrop open"
            onClick={() => setDrawerOpen(false)}
          />
          <MobileChatListDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            threads={threads}
            onSelect={handleSelectThread}
          />
        </>
      )}
    </div>
  );

  // Desktop view renderer
  const renderDesktopView = () => (
    <div className="pl-v5">
      {/* Top strip inside your existing PowerLine header area */}
      <div className="pl-v5-top">
        <div>
          <div className="pl-v5-title">PowerLine</div>
          <div className="pl-v5-subtitle">
            Real-time messaging for the PowerStream network
          </div>
        </div>
        <div className="pl-v5-top-right">
          {renderStatusPill()}
          <button
            className="pl-v5-newchat-btn"
            onClick={() => setNewChatModalOpen(true)}
          >
            + New chat
          </button>
        </div>
      </div>

      <div className="pl-v5-main">
        {/* LEFT – Threads */}
        <aside className="pl-v5-panel pl-v5-panel-left">
          <div className="pl-v5-panel-header">
            <span className="pl-v5-panel-title">Chats</span>
            <button
              className="pl-v5-panel-refresh"
              onClick={loadThreads}
              title="Refresh"
            >
              ⟳
            </button>
          </div>

          {threadsLoading && (
            <div className="pl-v5-empty">Loading conversations…</div>
          )}

          {!threadsLoading && threadsError && (
            <div className="pl-v5-error">{threadsError}</div>
          )}

          {!threadsLoading && !threadsError && threads.length === 0 && (
            <div className="pl-v5-empty">
              <div>No conversations yet</div>
              <div className="pl-v5-empty-sub">
                Click <strong>New chat</strong> to start one.
              </div>
            </div>
          )}

          {!threadsLoading && !threadsError && threads.length > 0 && (
            <div className="pl-v5-thread-list">
              {threads.map(renderThreadItem)}
            </div>
          )}
        </aside>

        {/* CENTER – Messages */}
        <section className="pl-v5-panel pl-v5-panel-center">
          {activeThread ? (
            <>
              <div className="pl-v5-thread-header">
                <div className="pl-v5-thread-header-main">
                  <div className="pl-v5-thread-header-title">
                    {activeThread.title || "Conversation"}
                  </div>
                  <div className="pl-v5-thread-header-sub">
                    Real-time messages • PowerStream
                  </div>
                </div>
              </div>

              <div className="pl-v5-messages">
                {messagesLoading && (
                  <div className="pl-v5-empty">Loading messages…</div>
                )}
                {!messagesLoading && messagesError && (
                  <div className="pl-v5-error">{messagesError}</div>
                )}
                {!messagesLoading &&
                  !messagesError &&
                  messages.length === 0 && (
                    <div className="pl-v5-empty">
                      No messages yet. Say something to start the thread.
                    </div>
                  )}

                {!messagesLoading &&
                  !messagesError &&
                  messages.length > 0 && (
                    <>
                      {messages.map(renderMessage)}
                      <div ref={messagesEndRef} />
                    </>
                  )}
              </div>

              {/* Composer */}
              <div className="pl-v5-composer">
                <textarea
                  className="pl-v5-composer-input"
                  placeholder="Type a message to send over PowerLine…"
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  className="pl-v5-send-btn"
                  onClick={handleSendMessage}
                  disabled={!composerText.trim() || sending}
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </>
          ) : (
            <div className="pl-v5-center-placeholder">
              <div className="pl-v5-center-icon">💬</div>
              <div className="pl-v5-center-title">Select a conversation</div>
              <div className="pl-v5-center-sub">
                Choose a chat from the left, or start a new one.
              </div>
            </div>
          )}
        </section>

        {/* RIGHT – Info panel */}
        <aside className="pl-v5-panel pl-v5-panel-right">
          <div className="pl-v5-panel-header">
            <span className="pl-v5-panel-title">Conversation info</span>
          </div>

          {activeThread ? (
            <div className="pl-v5-info-body">
              <div className="pl-v5-card">
                <div className="pl-v5-card-label">Title</div>
                <div className="pl-v5-card-value">
                  {activeThread.title || "Conversation"}
                </div>
              </div>

              <div className="pl-v5-card">
                <div className="pl-v5-card-label">Participants</div>
                <div className="pl-v5-participants">
                  {(activeThread.participants || []).map((p) => (
                    <div key={p._id || p.id} className="pl-v5-participant-row">
                      <div className="pl-v5-participant-avatar">
                        {(p.displayName || p.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="pl-v5-participant-meta">
                        <div className="pl-v5-participant-name">
                          {p.displayName || p.name || "User"}
                        </div>
                        <div className="pl-v5-participant-email">
                          {p.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pl-v5-card">
                <div className="pl-v5-card-label">Meta</div>
                <div className="pl-v5-meta-grid">
                  <div>
                    <span className="pl-v5-meta-label">Created</span>
                    <span className="pl-v5-meta-value">
                      {activeThread.createdAt
                        ? new Date(activeThread.createdAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="pl-v5-meta-label">Last activity</span>
                    <span className="pl-v5-meta-value">
                      {activeThread.lastActivityAt || activeThread.updatedAt
                        ? new Date(
                            activeThread.lastActivityAt || activeThread.updatedAt
                          ).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="pl-v5-empty">
              Pick a conversation to see its details.
            </div>
          )}
        </aside>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Simple New Chat modal */}
      {newChatModalOpen && (
        <div className="pl-v5-modal-backdrop" onClick={() => setNewChatModalOpen(false)}>
          <div
            className="pl-v5-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pl-v5-modal-title">Start a new chat</div>
            <div className="pl-v5-modal-body">
              <label className="pl-v5-modal-label">
                Chat title (or person's name)
              </label>
              <input
                className="pl-v5-modal-input"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="e.g. No Limit East Houston, Studio chat, etc."
              />
            </div>
            <div className="pl-v5-modal-footer">
              <button
                className="pl-v5-modal-btn pl-v5-modal-btn-secondary"
                onClick={() => setNewChatModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="pl-v5-modal-btn pl-v5-modal-btn-primary"
                onClick={handleCreateNewChat}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
