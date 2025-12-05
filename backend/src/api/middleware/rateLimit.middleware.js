// backend/src/api/middleware/rateLimit.middleware.js
// Redis-based rate limiting
import { checkRateLimit, isRedisConnected } from "../../config/redis.js";
import env from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { ApiError } from "../../utils/errors.js";

/**
 * Default rate limit configuration
 */
const DEFAULT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many requests, please try again later",
  keyGenerator: (req) => req.ip || "unknown",
  skip: (req) => false,
  onLimitReached: (req, res) => {},
};

/**
 * Rate limit configuration by endpoint pattern
 */
const ENDPOINT_LIMITS = {
  // Auth endpoints - stricter limits
  "/api/auth/login": { max: 5, windowMs: 60 * 1000 },
  "/api/auth/register": { max: 3, windowMs: 60 * 1000 },
  "/api/auth/forgot-password": { max: 3, windowMs: 60 * 1000 },
  
  // Upload endpoints - moderate limits
  "/api/upload": { max: 20, windowMs: 60 * 1000 },
  "/api/media": { max: 30, windowMs: 60 * 1000 },
  
  // Feed endpoints - higher limits
  "/api/feed": { max: 200, windowMs: 60 * 1000 },
  "/api/posts": { max: 200, windowMs: 60 * 1000 },
  
  // Default for other endpoints
  default: { max: 100, windowMs: 60 * 1000 },
};

/**
 * Get rate limit config for a given path
 */
const getConfigForPath = (path) => {
  for (const [pattern, config] of Object.entries(ENDPOINT_LIMITS)) {
    if (pattern !== "default" && path.startsWith(pattern)) {
      return config;
    }
  }
  return ENDPOINT_LIMITS.default;
};

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware = async (req, res, next) => {
  // Skip rate limiting if disabled or in test mode
  if (!env.ENABLE_RATE_LIMITING || env.isTest()) {
    return next();
  }
  
  // Skip health endpoints
  if (req.path === "/health" || req.path === "/api/health") {
    return next();
  }
  
  // Get config for this endpoint
  const config = getConfigForPath(req.path);
  const windowSeconds = Math.floor(config.windowMs / 1000);
  
  // Build rate limit key
  const userId = req.user?.id || "anon";
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const key = `ratelimit:${req.path}:${userId}:${ip}`;
  
  try {
    const result = await checkRateLimit(key, config.max, windowSeconds);
    
    // Set rate limit headers
    res.set({
      "X-RateLimit-Limit": config.max,
      "X-RateLimit-Remaining": result.remaining,
      "X-RateLimit-Reset": Math.floor(Date.now() / 1000) + result.resetIn,
    });
    
    if (!result.allowed) {
      logger.warn(`Rate limit exceeded for ${key}`);
      return next(new ApiError(429, "Too many requests, please try again later"));
    }
    
    next();
  } catch (err) {
    // If rate limiting fails, allow the request (fail open)
    logger.error("Rate limit check failed:", err.message);
    next();
  }
};

/**
 * Create a custom rate limiter
 */
export const createRateLimiter = (options = {}) => {
  const config = { ...DEFAULT_CONFIG, ...options };
  
  return async (req, res, next) => {
    if (config.skip(req)) {
      return next();
    }
    
    const key = `ratelimit:custom:${config.keyGenerator(req)}`;
    const windowSeconds = Math.floor(config.windowMs / 1000);
    
    try {
      const result = await checkRateLimit(key, config.max, windowSeconds);
      
      res.set({
        "X-RateLimit-Limit": config.max,
        "X-RateLimit-Remaining": result.remaining,
        "X-RateLimit-Reset": Math.floor(Date.now() / 1000) + result.resetIn,
      });
      
      if (!result.allowed) {
        config.onLimitReached(req, res);
        return next(new ApiError(429, config.message));
      }
      
      next();
    } catch (err) {
      logger.error("Custom rate limit check failed:", err.message);
      next();
    }
  };
};

/**
 * Strict rate limiter for sensitive endpoints
 */
export const strictRateLimiter = createRateLimiter({
  max: 5,
  windowMs: 60 * 1000,
  message: "Too many attempts, please try again in a minute",
  keyGenerator: (req) => `${req.ip}:${req.user?.id || "anon"}`,
});

/**
 * IP-based rate limiter (for registration, forgot password, etc.)
 */
export const ipRateLimiter = createRateLimiter({
  max: 3,
  windowMs: 60 * 1000,
  message: "Too many requests from this IP, please try again later",
  keyGenerator: (req) => req.ip,
});

export default {
  rateLimitMiddleware,
  createRateLimiter,
  strictRateLimiter,
  ipRateLimiter,
};

