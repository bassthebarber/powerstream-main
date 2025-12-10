// backend/src/domain/models/index.js
// Central model exports for the PowerStream Meta-style architecture
// All models should be imported from here for consistency

// ============================================================
// CORE MODELS (migrated from /backend/models)
// ============================================================

export { default as User, USER_ROLES, USER_LABELS, USER_STATUS } from "./User.model.js";
export { default as Post, POST_CHANNELS, POST_TYPES, POST_VISIBILITY } from "./Post.model.js";
export { default as Message, ChatMessage, MESSAGE_TYPES, MESSAGE_STATUS } from "./Message.model.js";
export { default as Station, STATION_CATEGORIES, STATION_STATUS, STATION_NETWORKS } from "./Station.model.js";
export { default as StreamSession, LiveSession, SESSION_TYPES, SESSION_STATUS, STREAM_QUALITY } from "./StreamSession.model.js";
export { default as CoinTransaction, TRANSACTION_TYPES, TRANSACTION_STATUS, PAYMENT_METHODS } from "./CoinTransaction.model.js";
export { default as WithdrawalRequest, Withdrawal, WITHDRAWAL_METHODS, WITHDRAWAL_STATUS } from "./WithdrawalRequest.model.js";

// ============================================================
// EVENT & ANALYTICS MODELS
// ============================================================

export { default as Event, EVENT_TYPES, ENTITY_TYPES } from "./Event.model.js";
export { default as Relationship } from "./Relationship.model.js";

// ============================================================
// ADVANCED MODELS (Meta/TikTok-style features)
// ============================================================

export { default as InterestProfile } from "./InterestProfile.model.js";
export { default as CreatorStats } from "./CreatorStats.model.js";
export { default as IdentityProfile } from "./IdentityProfile.model.js";

// ============================================================
// MODEL DESCRIPTIONS
// ============================================================

/**
 * Model Index:
 * 
 * === CORE MODELS ===
 * 
 * User - PowerStream user accounts
 *   - Authentication, roles, permissions
 *   - Coin balance, settings, preferences
 *   - Social metrics (followers, following)
 * 
 * Post - Feed/Gram/Reel content
 *   - Text, image, video posts
 *   - Engagement metrics
 *   - Visibility and moderation
 * 
 * Message - Chat messages
 *   - Text, media, file attachments
 *   - Delivery/read status
 *   - Reactions and replies
 * 
 * Station - TV stations/channels
 *   - Live streaming configuration
 *   - Schedule and playlist
 *   - Network/region affiliation
 * 
 * StreamSession - Live stream sessions
 *   - Stream metrics and quality
 *   - Multistream support
 *   - Recording/VOD
 * 
 * CoinTransaction - PowerCoin transactions
 *   - Tips, deposits, withdrawals
 *   - Payment method details
 *   - Fee tracking
 * 
 * WithdrawalRequest - Payout requests
 *   - Payment method details
 *   - Approval workflow
 *   - Transaction tracking
 * 
 * === ANALYTICS MODELS ===
 * 
 * Event - Unified event log
 *   - Tracks all user actions
 *   - Used for analytics and ML
 * 
 * Relationship - Social graph edges
 *   - Follow, friend, block
 * 
 * === ADVANCED MODELS ===
 * 
 * InterestProfile - User interest tracking
 *   - Topic scores with decay
 *   - Content preferences
 * 
 * CreatorStats - Creator metrics
 *   - Performance scores
 *   - Tier assignment
 * 
 * IdentityProfile - Unified identity
 *   - Global handle
 *   - Cross-app preferences
 */
