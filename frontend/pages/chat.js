// pages/chat.js
import React from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import styles from '../styles/ChatPage.module.css';

const ChatPage = () => {
  return (
    <div className={styles.container}>
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
