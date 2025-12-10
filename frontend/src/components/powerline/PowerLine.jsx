// frontend/src/components/powerline/PowerLine.jsx

import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { powerlineClient } from "../../api/powerlineClient";
import ThreadList from "./ThreadList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import styles from "./PowerLine.module.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

function getAuthToken() {
  return localStorage.getItem("powerstreamToken");
}

const PowerLine = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Socket.io connection
  const socket = useMemo(() => {
    const token = getAuthToken();
    if (!token) return null;

    const s = io(`${API_BASE_URL}/chat`, {
      auth: { token: token.replace(/^"(.+)"$/, "$1") },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    s.on("connect", () => {
      console.log("✅ PowerLine socket connected");
    });

    s.on("disconnect", (reason) => {
      console.log("❌ PowerLine socket disconnected:", reason);
    });

    s.on("connect_error", (err) => {
      console.error("PowerLine socket error:", err.message);
    });

    return s;
  }, []);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Only append if it's for the active thread
      const msgThreadId = msg.room || msg.conversation || msg.threadId;
      const activeId = selectedThread?._id || selectedThread?.id;
      
      if (activeId && String(msgThreadId) === String(activeId)) {
        setMessages((prev) => {
          // Prevent duplicates
          const exists = prev.some(
            (m) => (m._id || m.id) === (msg._id || msg.id)
          );
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    };

    // V5 event
    socket.on("message:new", handleNewMessage);
    // Legacy event
    socket.on("chat:message", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("chat:message", handleNewMessage);
      socket.disconnect();
    };
  }, [socket, selectedThread]);

  // Fetch threads on mount
  useEffect(() => {
    const run = async () => {
      try {
        setLoadingThreads(true);
        setError("");
        const data = await powerlineClient.getThreads();
        const list = data.threads || data.items || [];
        setThreads(list);
        if (list.length && !selectedThread) {
          handleSelectThread(list[0]);
        }
      } catch (err) {
        console.error("PowerLine getThreads error:", err);
        setError(err.message || "Failed to load conversations");
      } finally {
        setLoadingThreads(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Join / leave socket room when thread changes
  useEffect(() => {
    if (!socket) return;
    if (!selectedThread) return;

    const id = selectedThread._id || selectedThread.id;
    if (!id) return;

    // V5 event
    socket.emit("join:thread", id);
    // Legacy event
    socket.emit("chat:join", id);

    return () => {
      socket.emit("leave:thread", id);
      socket.emit("chat:leave", id);
    };
  }, [socket, selectedThread]);

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    if (!thread) {
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      setError("");
      const id = thread._id || thread.id;
      const data = await powerlineClient.getMessages(id);
      const msgs = data.messages || data.items || [];
      
      // Sort oldest first
      msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(msgs);
      
      // Mark as read (fire and forget)
      const lastIds = msgs.map((m) => m._id || m.id).filter(Boolean);
      if (lastIds.length) {
        powerlineClient.markRead(id, lastIds).catch(() => {});
      }
    } catch (err) {
      console.error("PowerLine getMessages error:", err);
      setError(err.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || !selectedThread) return;
    const id = selectedThread._id || selectedThread.id;

    // Optimistic append
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      text: text.trim(),
      sender: "me",
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setSending(true);
      setError("");
      
      // Try socket first
      if (socket?.connected) {
        socket.emit("message:send", { threadId: id, text: text.trim() });
        socket.emit("chat:message", { chatId: id, text: text.trim() });
      }
      
      // Also send via REST for persistence
      const msg = await powerlineClient.sendMessage(id, text.trim());

      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...msg, pending: false } : m))
      );
    } catch (err) {
      console.error("PowerLine sendMessage error:", err);
      setError(err.message || "Failed to send message");
      // Remove failed optimistic message
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const activeThreadId = selectedThread && (selectedThread._id || selectedThread.id);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.brand}>💬 PowerLine</div>
        <div className={styles.statusDot} />
      </div>

      <div className={styles.body}>
        <ThreadList
          threads={threads}
          loading={loadingThreads}
          selectedId={activeThreadId}
          onSelect={handleSelectThread}
        />

        <div className={styles.chatPane}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          {activeThreadId ? (
            <>
              <MessageList
                thread={selectedThread}
                messages={messages}
                loading={loadingMessages}
              />
              <MessageInput
                onSend={handleSendMessage}
                sending={sending}
                disabled={!activeThreadId}
              />
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💬</div>
              <div className={styles.emptyTitle}>Select a conversation</div>
              <div className={styles.emptyText}>
                Choose a chat from the left to start messaging in PowerLine.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerLine;
