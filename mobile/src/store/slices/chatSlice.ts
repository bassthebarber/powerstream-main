/**
 * Chat Redux slice
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatApi, Conversation, Message } from '../../api';

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  typingUsers: { [conversationId: string]: string[] };
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  typingUsers: {},
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const conversations = await chatApi.getConversations();
      return conversations;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, page = 1 }: { conversationId: string; page?: number }, { rejectWithValue }) => {
    try {
      const result = await chatApi.getMessages(conversationId, page);
      return { messages: result.messages, conversationId, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content }: { conversationId: string; content: string }, { rejectWithValue }) => {
    try {
      const message = await chatApi.sendMessage({ conversationId, content });
      // Also emit via socket for real-time delivery
      chatApi.emitMessage(message);
      return message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
      state.messages = [];
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Check for duplicates
      if (!state.messages.find((m) => m.id === action.payload.id)) {
        state.messages.push(action.payload);
      }
    },
    setTypingUser: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (!state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      }
    },
    removeTypingUser: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          (id) => id !== userId
        );
      }
    },
    updateConversationLastMessage: (state, action: PayloadAction<Message>) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (conversation) {
        conversation.lastMessage = {
          content: action.payload.content,
          senderId: action.payload.senderId,
          createdAt: action.payload.createdAt,
        };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder.addCase(fetchConversations.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.conversations = action.payload;
    });
    builder.addCase(fetchConversations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.page === 1) {
        state.messages = action.payload.messages;
      } else {
        state.messages = [...action.payload.messages, ...state.messages];
      }
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Send message
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.messages.push(action.payload);
    });
  },
});

export const {
  setCurrentConversation,
  addMessage,
  setTypingUser,
  removeTypingUser,
  updateConversationLastMessage,
} = chatSlice.actions;

export default chatSlice.reducer;



