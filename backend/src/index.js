// backend/src/index.js
// Main exports for the new Meta-style architecture

// Config
export { default as env, buildMongoUri, getAllowedOrigins, validateEnv } from "./config/env.js";
export { logger, logRequest, logEvent, logError } from "./config/logger.js";
export { connectMongo, disconnectMongo, getMongoState } from "./config/db.mongo.js";
export { 
  initRedis, 
  getRedis, 
  disconnectRedis, 
  cacheGet, 
  cacheSet, 
  cacheDel,
  checkRateLimit,
  cacheUserProfile,
  getCachedUserProfile,
  invalidateUserCache,
} from "./config/redis.js";
export { 
  initCloudinary, 
  uploadToCloudinary, 
  deleteFromCloudinary,
  getOptimizedUrl,
  getVideoThumbnail,
} from "./config/cloudinary.js";

// Loaders
export { configureExpress, configureErrorHandling, configureHealthRoutes } from "./loaders/express.js";
export { initSocketIO, initAllSockets, getIO } from "./loaders/socket.js";
export { initQueues, shutdownQueues, logEvent as queueLogEvent, queueNotification } from "./loaders/jobs.js";

// Domain Models
export { default as Event, EVENT_TYPES, ENTITY_TYPES } from "./domain/models/Event.model.js";
export { default as Relationship, RELATIONSHIP_TYPES, RELATIONSHIP_STATUS } from "./domain/models/Relationship.model.js";

// Repositories
export { default as userRepository } from "./domain/repositories/user.repository.js";
export { default as relationshipsRepository } from "./domain/repositories/relationships.repository.js";
export { default as eventsRepository } from "./domain/repositories/events.repository.js";

// Services
export { default as authService } from "./services/auth.service.js";
export { default as recommendationService } from "./services/recommendation.service.js";
export { default as graphService } from "./services/graph.service.js";
export { default as eventsService } from "./services/events.service.js";

// Middleware
export { 
  authMiddleware, 
  optionalAuth, 
  requireRoles, 
  requireAdmin,
  requireVerified,
  generateTokens,
  verifyRefreshToken,
  requireAuth,
  authRequired,
} from "./api/middleware/auth.middleware.js";
export { errorMiddleware, notFoundMiddleware, asyncHandler, wrapController } from "./api/middleware/error.middleware.js";
export { rateLimitMiddleware, createRateLimiter, strictRateLimiter } from "./api/middleware/rateLimit.middleware.js";
export { requestLoggerMiddleware } from "./api/middleware/requestLogger.middleware.js";
export { validate, objectIdSchema, emailSchema, passwordSchema, paginationSchema } from "./api/middleware/validate.middleware.js";

// Utils
export { 
  ApiError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError, 
  ConflictError,
  ValidationError,
  RateLimitError,
  catchAsync,
  assertExists,
  assertOwner,
} from "./utils/errors.js";
export { parsePagination, paginatedResponse, cursorPaginatedResponse } from "./utils/pagination.js";
export { isValidObjectId, toObjectId, generateId, generateToken, generateShortCode } from "./utils/ids.js";
export { hashPassword, comparePassword, generateSecureToken, sha256, encrypt, decrypt } from "./utils/crypto.js";

// ML Client
export { default as recommendationClient } from "./ml/client/recommendationClient.js";

// App
export { createApp } from "./app.js";




