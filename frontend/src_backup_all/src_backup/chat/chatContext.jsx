import { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  return (
    <ChatContext.Provider value={{ activeChat, setActiveChat, messages, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
};


