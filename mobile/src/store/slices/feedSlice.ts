/**
 * Feed Redux slice
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { feedApi, Post, Story } from '../../api';

interface FeedState {
  posts: Post[];
  stories: Story[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: FeedState = {
  posts: [],
  stories: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  page: 1,
  hasMore: true,
};

// Async thunks
export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await feedApi.getFeed(page);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load feed');
    }
  }
);

export const refreshFeed = createAsyncThunk(
  'feed/refreshFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await feedApi.getFeed(1);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh feed');
    }
  }
);

export const fetchStories = createAsyncThunk(
  'feed/fetchStories',
  async (_, { rejectWithValue }) => {
    try {
      const stories = await feedApi.getStories();
      return stories;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load stories');
    }
  }
);

export const likePost = createAsyncThunk(
  'feed/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const result = await feedApi.likePost(postId);
      return { postId, likes: result.likes };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const unlikePost = createAsyncThunk(
  'feed/unlikePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const result = await feedApi.unlikePost(postId);
      return { postId, likes: result.likes };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unlike post');
    }
  }
);

// Slice
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearFeed: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch feed
    builder.addCase(fetchFeed.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchFeed.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.meta.arg === 1) {
        state.posts = action.payload.posts;
      } else {
        state.posts = [...state.posts, ...action.payload.posts];
      }
      state.page = action.payload.pagination.page;
      state.hasMore = action.payload.pagination.hasMore;
    });
    builder.addCase(fetchFeed.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Refresh feed
    builder.addCase(refreshFeed.pending, (state) => {
      state.isRefreshing = true;
    });
    builder.addCase(refreshFeed.fulfilled, (state, action) => {
      state.isRefreshing = false;
      state.posts = action.payload.posts;
      state.page = 1;
      state.hasMore = action.payload.pagination.hasMore;
    });
    builder.addCase(refreshFeed.rejected, (state) => {
      state.isRefreshing = false;
    });

    // Fetch stories
    builder.addCase(fetchStories.fulfilled, (state, action) => {
      state.stories = action.payload;
    });

    // Like post
    builder.addCase(likePost.fulfilled, (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload.postId);
      if (post) {
        post.likes = action.payload.likes;
        post.isLiked = true;
      }
    });

    // Unlike post
    builder.addCase(unlikePost.fulfilled, (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload.postId);
      if (post) {
        post.likes = action.payload.likes;
        post.isLiked = false;
      }
    });
  },
});

export const { clearFeed, addPost } = feedSlice.actions;
export default feedSlice.reducer;



