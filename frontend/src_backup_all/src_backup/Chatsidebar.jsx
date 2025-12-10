// frontend/src/ChatSidebar.js
import React, { useEffect, useState } from "react";
import "./styles/chat-sidebar.css"; // Optional external styles
import { getFriendsOrConversations } from "./utils/chatroom"; // API helper

const ChatSidebar = ({ onSelectChat, activeChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const data = await getFriendsOrConversations(); // could be from backend
        setChats(data || []);
      } catch (err) {
        console.error("Error loading chats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, []);

  return (
    <div style={styles.sidebar}>
      <h3 style={styles.header}>💬 Chats</h3>
      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : (
        <ul style={styles.list}>
          {chats.map((chat) => (
            <li
              key={chat._id}
              style={{
                ...styles.item,
                backgroundColor: chat._id === activeChatId ? "#222" : "transparent"
              }}
              onClick={() => onSelectChat(chat)}
            >
              <img
                src={chat.avatar || "/default-avatar.png"}
                alt="avatar"
                style={styles.avatar}
              />
              <div>
                <p style={styles.name}>{chat.name}</p>
                <p style={styles.lastMessage}>
                  {chat.lastMessage || "No messages yet"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  sidebar: {
    width: "280px",
    height: "100vh",
    background: "#000",
    color: "#fff",
    borderRight: "1px solid #333",
    padding: "16px",
    overflowY: "auto"
  },
  header: {
    marginBottom: "16px",
    fontSize: "20px",
    fontWeight: "bold"
  },
  loading: {
    fontSize: "14px",
    color: "#aaa"
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "8px",
    transition: "background 0.2s"
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover"
  },
  name: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "4px"
  },
  lastMessage: {
    fontSize: "13px",
    color: "#aaa"
  }
};

export default ChatSidebar;


