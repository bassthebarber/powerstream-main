// frontend/src/api/index.js
// Central API exports for PowerStream frontend

// HTTP Client (base)
export { default as httpClient } from "./httpClient.js";

// Feature APIs
export { default as authApi } from "./authApi.js";
export { default as feedApi } from "./feedApi.js";
export { default as chatApi } from "./chatApi.js";
export { default as tvApi } from "./tvApi.js";
export { default as coinsApi } from "./coinsApi.js";
export { default as eventsApi, EVENT_TYPES, ENTITY_TYPES } from "./eventsApi.js";

// Studio API (existing)
export { default as studioApi } from "./studioApi.js";

// Brain API (existing)
export { default as brainApi } from "./brainApi.js";

/**
 * API Index:
 * 
 * httpClient - Base Axios client with JWT interceptors
 * 
 * authApi - Authentication
 *   - login, register, getCurrentUser
 *   - refreshToken, logout
 *   - passwordReset, verifyEmail
 * 
 * feedApi - Posts & Content
 *   - getFeed, getExploreFeed
 *   - createPost, updatePost, deletePost
 *   - likePost, sharePost, addComment
 *   - getGrams, getReels, getStories
 * 
 * chatApi - Messaging
 *   - getConversations, getMessages
 *   - sendMessage, markAsRead
 *   - searchMessages, reactions
 * 
 * tvApi - TV & Streaming
 *   - getStations, getStation
 *   - getTVGuide, getWhatsOnNow
 *   - startWatching, stopWatching
 *   - multistream management
 * 
 * coinsApi - PowerCoins
 *   - getBalance, getTransactions
 *   - sendTip, purchaseCoins
 *   - requestWithdrawal
 *   - leaderboards
 * 
 * eventsApi - Analytics
 *   - logEvent, logView, logPageView
 *   - logSearch, logStreamJoin
 *   - batch event logging
 * 
 * studioApi - AI Studio
 *   - recording, mixing, mastering
 *   - beat generation
 *   - export and collaboration
 * 
 * brainApi - Voice/Command AI
 *   - processCommand
 *   - navigation intents
 */



