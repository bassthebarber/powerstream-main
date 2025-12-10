// /context/StreamContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { fetchStreamData, startStream, stopStream, sendStreamMessage } from "../utils/stream.api";

const StreamContext = createContext();

export const StreamProvider = ({ children }) => {
  const [currentStream, setCurrentStream] = useState(null);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadStream = async (streamId) => {
    setLoading(true);
    try {
      const data = await fetchStreamData(streamId);
      setCurrentStream(data || null);
      setIsLive(data?.isLive || false);
      setViewers(data?.viewers || 0);
    } catch (error) {
      console.error("Error loading stream:", error);
    } finally {
      setLoading(false);
    }
  };

  const goLive = async (streamId) => {
    try {
      await startStream(streamId);
      setIsLive(true);
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  const endLive = async (streamId) => {
    try {
      await stopStream(streamId);
      setIsLive(false);
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  };

  const sendMessage = async (streamId, message) => {
    try {
      const newMsg = await sendStreamMessage(streamId, message);
      setMessages((prev) => [...prev, newMsg]);
    } catch (error) {
      console.error("Error sending stream message:", error);
    }
  };

  return (
    <StreamContext.Provider
      value={{
        currentStream,
        viewers,
        messages,
        isLive,
        loading,
        loadStream,
        goLive,
        endLive,
        sendMessage,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
};

export const useStream = () => useContext(StreamContext);
