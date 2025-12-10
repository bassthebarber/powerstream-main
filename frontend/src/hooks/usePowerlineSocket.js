// frontend/src/hooks/usePowerlineSocket.js
// PowerLine Socket.IO Hook - Fully Fixed Connection

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// HARDCODED for reliable connection
const SOCKET_URL = 'http://localhost:5001';

export const usePowerlineSocket = ({
  activeThreadId,
  onMessageReceived,
  onThreadUpdated,
  onTyping,
  onStopTyping
}) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Get token helper
  const getToken = useCallback(() => {
    return (
      localStorage.getItem('powerstreamToken') || 
      localStorage.getItem('powerstream_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      ''
    );
  }, []);

  useEffect(() => {
    const token = getToken();
    
    console.log('[PowerlineSocket] Connecting to:', `${SOCKET_URL}/powerline`);
    console.log('[PowerlineSocket] Has token:', !!token);

    // Connect to /powerline namespace
    const socket = io(`${SOCKET_URL}/powerline`, {
      auth: token ? { token } : undefined,
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[PowerlineSocket] ✅ Connected:', socket.id);
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('[PowerlineSocket] Disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[PowerlineSocket] Connection error:', err.message);
      setConnected(false);
      setError(err.message);
    });

    socket.on('error', (err) => {
      console.error('[PowerlineSocket] Socket error:', err);
      setError(typeof err === 'string' ? err : err.message);
    });

    // Message event
    socket.on('message:new', (payload) => {
      console.log('[PowerlineSocket] New message:', payload);
      onMessageReceived?.(payload);
    });

    // Thread preview update
    socket.on('thread:updated', (payload) => {
      console.log('[PowerlineSocket] Thread updated:', payload);
      onThreadUpdated?.(payload);
    });

    // Typing indicators
    socket.on('typing', (payload) => {
      onTyping?.(payload);
    });

    socket.on('stopTyping', (payload) => {
      onStopTyping?.(payload);
    });

    return () => {
      console.log('[PowerlineSocket] Disconnecting...');
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [getToken, onMessageReceived, onThreadUpdated, onTyping, onStopTyping]);

  // Handle room joins when activeThreadId changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Wait for connection before joining
    const joinRoom = () => {
      if (activeThreadId && socket.connected) {
        console.log('[PowerlineSocket] Joining thread:', activeThreadId);
        socket.emit('thread:join', activeThreadId);
      }
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once('connect', joinRoom);
    }

    return () => {
      if (activeThreadId && socket?.connected) {
        console.log('[PowerlineSocket] Leaving thread:', activeThreadId);
        socket.emit('thread:leave', activeThreadId);
      }
    };
  }, [activeThreadId]);

  const sendMessage = useCallback((threadId, text) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn('[PowerlineSocket] Cannot send - not connected');
      return false;
    }
    console.log('[PowerlineSocket] Sending message:', { threadId, text });
    socket.emit('message:send', { threadId, text });
    return true;
  }, []);

  const emitTyping = useCallback((threadId) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit('typing', threadId);
  }, []);

  const emitStopTyping = useCallback((threadId) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit('stopTyping', threadId);
  }, []);

  return {
    connected,
    error,
    sendMessage,
    emitTyping,
    emitStopTyping
  };
};
