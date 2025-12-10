// frontend/src/config/apiConfig.js
// Centralized API configuration

/**
 * Determine if we're running in local development
 * This detects localhost/127.0.0.1 regardless of what the env var says
 */
const isLocalDev = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');
};

/**
 * API Base URL
 * - In local development (localhost), always use local backend at port 5001
 * - Otherwise, use environment variable or fallback to local
 */
export const API_BASE_URL = isLocalDev() 
  ? 'http://localhost:5001/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');

/**
 * Socket.IO URL
 * - In local development (localhost), always use local backend at port 5001
 */
export const SOCKET_URL = isLocalDev()
  ? 'http://localhost:5001'
  : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');

/**
 * API Version
 */
export const API_VERSION = 'v1';

/**
 * Cloudinary configuration (for direct uploads)
 */
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'powerstream',
};

/**
 * Feature flags
 */
export const FEATURES = {
  ENABLE_STUDIO: import.meta.env.VITE_ENABLE_STUDIO !== 'false',
  ENABLE_TV: import.meta.env.VITE_ENABLE_TV !== 'false',
  ENABLE_COINS: import.meta.env.VITE_ENABLE_COINS !== 'false',
  ENABLE_BRAIN_MODE: import.meta.env.VITE_ENABLE_BRAIN_MODE !== 'false',
  ENABLE_REELS: import.meta.env.VITE_ENABLE_REELS !== 'false',
  ENABLE_STORIES: import.meta.env.VITE_ENABLE_STORIES !== 'false',
};

/**
 * Timeouts and limits
 */
export const LIMITS = {
  API_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 120000, // 2 minutes for uploads
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB
};

/**
 * API endpoint paths
 */
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    FOLLOW: '/users/follow',
    UNFOLLOW: '/users/unfollow',
    FOLLOWERS: '/users/followers',
    FOLLOWING: '/users/following',
    SUGGESTIONS: '/users/suggestions',
  },
  
  // Feed
  FEED: {
    HOME: '/powerfeed',
    RECOMMENDED: '/feed/recommended',
    CREATE: '/powerfeed',
    LIKE: (id) => `/powerfeed/${id}/like`,
    COMMENT: (id) => `/powerfeed/${id}/comments`,
    SHARE: (id) => `/powerfeed/${id}/share`,
  },
  
  // Stories
  STORIES: {
    LIST: '/stories',
    CREATE: '/stories',
    VIEW: (id) => `/stories/${id}/view`,
  },
  
  // Gram
  GRAM: {
    LIST: '/powergram',
    CREATE: '/powergram',
    GET: (id) => `/powergram/${id}`,
  },
  
  // Reels
  REELS: {
    LIST: '/powerreel',
    CREATE: '/powerreel',
    GET: (id) => `/powerreel/${id}`,
    LIKE: (id) => `/powerreel/${id}/like`,
    VIEW: (id) => `/powerreel/${id}/view`,
  },
  
  // Chat / PowerLine V5
  CHAT: {
    THREADS: '/powerline/threads',
    THREAD: (id) => `/powerline/threads/${id}`,
    MESSAGES: (id) => `/powerline/threads/${id}/messages`,
    SEND: (id) => `/powerline/threads/${id}/messages`,
    CREATE: '/powerline/threads',
    MARK_READ: (id) => `/powerline/threads/${id}/read`,
    UNREAD: '/powerline/unread',
    REACTIONS: (threadId, msgId) => `/powerline/threads/${threadId}/messages/${msgId}/reactions`,
    DEV_SEED: '/powerline/dev/seed',
  },
  
  // TV
  TV: {
    STATIONS: '/tv/stations',
    STATION: (id) => `/tv/stations/${id}`,
    LIVE: '/tv/guide',
    SHOWS: '/shows',
    VOD: '/vod',
  },
  
  // Studio
  STUDIO: {
    SESSIONS: '/studio/sessions',
    EXPORTS: '/studio/exports',
    BEATS: '/beats',
  },
  
  // Coins
  COINS: {
    BALANCE: '/coins/balance',
    TIP: '/coins/tip',
    HISTORY: '/coins/history',
    BUY: '/coins/buy',
  },
  
  // Brain Mode
  BRAIN: {
    COMMAND: '/brain/commands',
    NAVIGATE: '/brain/navigation',
    ACTION: '/brain/actions',
    INTENTS: '/brain/intents',
  },
};

export default {
  API_BASE_URL,
  SOCKET_URL,
  API_VERSION,
  CLOUDINARY_CONFIG,
  FEATURES,
  LIMITS,
  ENDPOINTS,
};


