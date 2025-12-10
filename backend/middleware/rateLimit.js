// backend/middleware/rateLimit.js
// Rate limiting middleware per Overlord Spec
import { logger } from "../utils/logger.js";

// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const rateLimitStore = new Map();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.max - Maximum requests per window (default: 100)
 * @param {string} options.message - Error message (default: "Too many requests")
 * @param {boolean} options.skipFailedRequests - Don't count failed requests (default: false)
 * @param {Function} options.keyGenerator - Custom key generator (default: IP-based)
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute default
    max = 100,
    message = "Too many requests, please try again later",
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip || req.connection?.remoteAddress || "unknown",
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      res.set("Retry-After", retryAfter);
      res.set("X-RateLimit-Limit", max);
      res.set("X-RateLimit-Remaining", 0);
      res.set("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));

      logger.warn(`Rate limit exceeded for ${key}`);

      return res.status(429).json({
        success: false,
        message,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter,
      });
    }

    // Increment count
    entry.count++;

    // Set rate limit headers
    res.set("X-RateLimit-Limit", max);
    res.set("X-RateLimit-Remaining", Math.max(0, max - entry.count));
    res.set("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));

    // Optionally don't count failed requests
    if (skipFailedRequests) {
      res.on("finish", () => {
        if (res.statusCode >= 400) {
          entry.count--;
        }
      });
    }

    next();
  };
}

/**
 * Strict rate limiter for sensitive operations
 */
export function strictRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: "Too many attempts. Please try again in 15 minutes.",
  });
}

/**
 * API rate limiter for general endpoints
 */
export function apiRateLimit() {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    message: "API rate limit exceeded. Please slow down.",
  });
}

/**
 * Auth rate limiter for login/register
 */
export function authRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: "Too many authentication attempts. Please try again later.",
    keyGenerator: (req) => {
      // Use email/username for auth routes if available
      const identifier = req.body?.email || req.body?.username || req.ip;
      return `auth:${identifier}`;
    },
  });
}

export default rateLimit;


