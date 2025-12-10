import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import VoiceInputChat from "../../chat/VoiceInputChat";
import styles from "./chat.module.css";

// Connect to Socket.IO using your .env
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5001";
const socket = io(SOCKET_URL);

export default function ProfileChatPage() {
  const [messages, setMessages] = useState([]);
  const [chatPartner, setChatPartner] = useState(null); // Replace with selected contact logic
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Load old messages if available
  useEffect(() => {
    if (!chatPartner) return;
    fetch(`/api/chat/${chatPartner._id}`)
      .then(res => res.json())
      .then(data => setMessages(data || []))
      .catch(err => console.error("❌ Failed to load chat history:", err));
  }, [chatPartner]);

  // Socket.IO listeners
  useEffect(() => {
    socket.on("chat_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("chat_message");
    };
  }, []);

  // Send text message
  const sendMessage = () => {
    if (!text.trim() || !chatPartner) return;
    const msg = {
      to: chatPartner._id,
      text,
      fromSelf: true,
      createdAt: new Date().toISOString()
    };
    socket.emit("chat_message", msg);
    setMessages(prev => [...prev, msg]);
    setText("");
  };

  // Send voice message from VoiceInputChat
  const handleVoiceSend = (voiceText) => {
    setText(voiceText);
    setTimeout(sendMessage, 100); // send after setting text
  };

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        {chatPartner ? (
          <>
            <img src={chatPartner.avatar || "/default-avatar.png"} alt={chatPartner.name} className={styles.avatar} />
            <h3>{chatPartner.name}</h3>
          </>
        ) : (
          <h3>Select a contact to start chatting</h3>
        )}
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.message} ${msg.fromSelf ? styles.myMessage : styles.theirMessage}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {chatPartner && (
        <div className={styles.inputArea}>
          <input
            type="text"
            value={text}
            placeholder="Type your message..."
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
          <VoiceInputChat onSend={handleVoiceSend} />
        </div>
      )}
    </div>
  );
}
