/**
 * Chat API (PowerLine)
 * Mirrors web client: /api/chat/*, /api/powerline/*
 */
import httpClient from './httpClient';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  readBy: string[];
  createdAt: string;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
}

// Socket instance
let chatSocket: Socket | null = null;

/**
 * Chat API endpoints
 */
export const chatApi = {
  /**
   * Get all conversations
   * GET /api/powerline
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await httpClient.get('/powerline');
    return response.data.conversations || response.data;
  },

  /**
   * Get single conversation
   * GET /api/powerline/:id
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await httpClient.get(`/powerline/${conversationId}`);
    return response.data.conversation || response.data;
  },

  /**
   * Get messages for a conversation
   * GET /api/powerline/:id/messages
   */
  async getMessages(conversationId: string, page = 1): Promise<{ messages: Message[]; hasMore: boolean }> {
    const response = await httpClient.get(`/powerline/${conversationId}/messages`, {
      params: { page },
    });
    return response.data;
  },

  /**
   * Send a message
   * POST /api/powerline/:id/messages
   */
  async sendMessage(data: SendMessageData): Promise<Message> {
    const response = await httpClient.post(`/powerline/${data.conversationId}/messages`, {
      content: data.content,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
    });
    return response.data.message || response.data;
  },

  /**
   * Create new conversation
   * POST /api/powerline
   */
  async createConversation(participantIds: string[]): Promise<Conversation> {
    const response = await httpClient.post('/powerline', {
      participants: participantIds,
    });
    return response.data.conversation || response.data;
  },

  /**
   * Mark conversation as read
   * POST /api/powerline/:id/read
   */
  async markAsRead(conversationId: string): Promise<void> {
    await httpClient.post(`/powerline/${conversationId}/read`);
  },

  /**
   * Delete conversation
   * DELETE /api/powerline/:id
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await httpClient.delete(`/powerline/${conversationId}`);
  },

  // ============================================================
  // SOCKET METHODS
  // ============================================================

  /**
   * Connect to chat socket
   */
  connectSocket(token: string): Socket {
    if (chatSocket?.connected) {
      return chatSocket;
    }

    chatSocket = io(`${API_BASE_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    chatSocket.on('connect', () => {
      console.log('Chat socket connected');
    });

    chatSocket.on('disconnect', (reason) => {
      console.log('Chat socket disconnected:', reason);
    });

    chatSocket.on('error', (error) => {
      console.error('Chat socket error:', error);
    });

    return chatSocket;
  },

  /**
   * Disconnect from chat socket
   */
  disconnectSocket(): void {
    if (chatSocket) {
      chatSocket.disconnect();
      chatSocket = null;
    }
  },

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return chatSocket;
  },

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    chatSocket?.emit('join:conversation', conversationId);
  },

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    chatSocket?.emit('leave:conversation', conversationId);
  },

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, userId: string): void {
    chatSocket?.emit('typing:start', { conversationId, userId });
  },

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId: string, userId: string): void {
    chatSocket?.emit('typing:stop', { conversationId, userId });
  },

  /**
   * Emit message via socket (for real-time delivery)
   */
  emitMessage(message: Message): void {
    chatSocket?.emit('message:send', message);
  },

  /**
   * Listen for new messages
   */
  onNewMessage(callback: (message: Message) => void): void {
    chatSocket?.on('message:new', callback);
  },

  /**
   * Listen for typing indicators
   */
  onTyping(callback: (data: { userId: string }) => void): void {
    chatSocket?.on('user:typing', callback);
  },

  /**
   * Listen for stopped typing
   */
  onStoppedTyping(callback: (data: { userId: string }) => void): void {
    chatSocket?.on('user:stopped-typing', callback);
  },

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    chatSocket?.removeAllListeners();
  },
};

export default chatApi;



