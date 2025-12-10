// backend/src/services/index.js
// Central service exports for the PowerStream Meta-style architecture

// ============================================================
// CORE SERVICES
// ============================================================

export { default as authService } from "./auth.service.js";
export { default as usersService } from "./users.service.js";
export { default as eventsService } from "./events.service.js";
export { default as graphService } from "./graph.service.js";
export { default as recommendationService } from "./recommendation.service.js";

// ============================================================
// FEATURE SERVICES
// ============================================================

export { default as feedService } from "./feed.service.js";
export { default as chatService } from "./chat.service.js";
export { default as coinsService } from "./coins.service.js";
export { default as mediaService } from "./media.service.js";

// ============================================================
// ADVANCED SERVICES (Meta/TikTok-style features)
// ============================================================

export { default as interestGraphService } from "./interestGraph.service.js";
export { default as creatorScoreService } from "./creatorScore.service.js";
export { default as identityGraphService } from "./identityGraph.service.js";
export { default as brainService } from "./brain.service.js";
export { default as tvService } from "./tv.service.js";

// ============================================================
// SERVICE DESCRIPTIONS
// ============================================================

/**
 * Service Index:
 * 
 * === CORE SERVICES ===
 * 
 * authService - Authentication (login, register, tokens)
 * eventsService - Unified event logging for analytics
 * graphService - Social graph (follow, block, relationships)
 * recommendationService - Content recommendations (ML + rules)
 * 
 * === FEATURE SERVICES ===
 * 
 * feedService - Posts, feed generation, trending
 *   - Create/update/delete posts
 *   - Get personalized feed
 *   - Hashtag/search functionality
 * 
 * chatService - Messaging and conversations
 *   - Send/receive messages
 *   - Read receipts
 *   - Reactions
 * 
 * coinsService - PowerCoins transactions
 *   - Tips between users
 *   - Deposits/purchases
 *   - Withdrawals
 *   - Leaderboards
 * 
 * mediaService - Media uploads and processing
 *   - Image/video/audio uploads
 *   - Cloudinary integration
 *   - Thumbnail generation
 *   - Storage management
 * 
 * === ADVANCED SERVICES ===
 * 
 * interestGraphService - Real-Time Interest Graph (RIIG)
 *   - Tracks user interests based on engagement
 *   - Decays old interests over time
 *   - Provides personalization data for recommendations
 * 
 * creatorScoreService - Creator Score System
 *   - Tracks creator performance metrics
 *   - Calculates reputation scores (0-100)
 *   - Assigns tiers (bronze to diamond)
 *   - Provides leaderboards
 * 
 * identityGraphService - Unified Identity Graph (UIG)
 *   - Cross-app identity management
 *   - Global handles and preferences
 *   - Verification status
 *   - Onboarding tracking
 * 
 * brainService - Brain Mode (Voice/Command AI)
 *   - Processes voice and text commands
 *   - Intent recognition
 *   - Navigation and automation
 * 
 * tvService - Distributed TV Broadcast Engine
 *   - Station management
 *   - Live streaming
 *   - Show scheduling
 *   - VOD content
 */
