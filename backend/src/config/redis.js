// backend/src/config/redis.js
// Redis client with connection management and helpers
import { createClient } from "redis";
import env from "./env.js";
import { logger } from "./logger.js";

let client = null;
let isConnecting = false;

/**
 * Initialize Redis connection
 */
export const initRedis = async () => {
  if (!env.USE_REDIS) {
    logger.info("ℹ️ Redis: Disabled (USE_REDIS !== true)");
    return null;
  }
  
  if (client && client.isOpen) {
    return client;
  }
  
  if (isConnecting) {
    logger.info("Redis connection already in progress...");
    return null;
  }
  
  isConnecting = true;
  
  try {
    const redisConfig = {
      socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error("Redis max retries reached");
            return new Error("Redis max retries reached");
          }
          return Math.min(retries * 100, 3000);
        },
      },
      database: env.REDIS_DB,
    };
    
    if (env.REDIS_PASSWORD) {
      redisConfig.password = env.REDIS_PASSWORD;
    }
    
    client = createClient(redisConfig);
    
    client.on("error", (err) => {
      logger.error("❌ Redis error:", err.message);
    });
    
    client.on("connect", () => {
      logger.info("🟢 Redis: Connected");
    });
    
    client.on("reconnecting", () => {
      logger.info("🔄 Redis: Reconnecting...");
    });
    
    await client.connect();
    isConnecting = false;
    
    return client;
  } catch (err) {
    isConnecting = false;
    logger.error("❌ Redis connection failed:", err.message);
    return null;
  }
};

/**
 * Get Redis client (returns null if not connected)
 */
export const getRedis = () => client;

/**
 * Check if Redis is connected
 */
export const isRedisConnected = () => client?.isOpen || false;

/**
 * Disconnect Redis gracefully
 */
export const disconnectRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
    logger.info("Redis disconnected gracefully");
  }
};

// ============================================================
// CACHE HELPERS
// ============================================================

/**
 * Get cached value
 */
export const cacheGet = async (key) => {
  if (!client?.isOpen) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.error(`Cache get error for ${key}:`, err.message);
    return null;
  }
};

/**
 * Set cached value with optional TTL (seconds)
 */
export const cacheSet = async (key, value, ttlSeconds = 300) => {
  if (!client?.isOpen) return false;
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (err) {
    logger.error(`Cache set error for ${key}:`, err.message);
    return false;
  }
};

/**
 * Delete cached value
 */
export const cacheDel = async (key) => {
  if (!client?.isOpen) return false;
  try {
    await client.del(key);
    return true;
  } catch (err) {
    logger.error(`Cache delete error for ${key}:`, err.message);
    return false;
  }
};

/**
 * Delete cached values by pattern
 */
export const cacheDelPattern = async (pattern) => {
  if (!client?.isOpen) return false;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (err) {
    logger.error(`Cache delete pattern error for ${pattern}:`, err.message);
    return false;
  }
};

// ============================================================
// RATE LIMITING HELPERS
// ============================================================

/**
 * Check and increment rate limit
 * @param {string} key - Rate limit key (e.g., "ratelimit:user:123:login")
 * @param {number} limit - Max requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export const checkRateLimit = async (key, limit, windowSeconds) => {
  if (!client?.isOpen) {
    // If Redis is down, allow the request (fail open)
    return { allowed: true, remaining: limit, resetIn: 0 };
  }
  
  try {
    const current = await client.incr(key);
    
    if (current === 1) {
      // First request in window, set expiry
      await client.expire(key, windowSeconds);
    }
    
    const ttl = await client.ttl(key);
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetIn: ttl > 0 ? ttl : windowSeconds,
    };
  } catch (err) {
    logger.error(`Rate limit check error for ${key}:`, err.message);
    return { allowed: true, remaining: limit, resetIn: 0 };
  }
};

// ============================================================
// SESSION / USER CACHE HELPERS
// ============================================================

const USER_CACHE_TTL = 300; // 5 minutes

/**
 * Cache user profile
 */
export const cacheUserProfile = async (userId, profile) => {
  return cacheSet(`user:profile:${userId}`, profile, USER_CACHE_TTL);
};

/**
 * Get cached user profile
 */
export const getCachedUserProfile = async (userId) => {
  return cacheGet(`user:profile:${userId}`);
};

/**
 * Invalidate user profile cache
 */
export const invalidateUserCache = async (userId) => {
  await cacheDel(`user:profile:${userId}`);
  await cacheDelPattern(`user:*:${userId}:*`);
};

export default {
  initRedis,
  getRedis,
  isRedisConnected,
  disconnectRedis,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
  checkRateLimit,
  cacheUserProfile,
  getCachedUserProfile,
  invalidateUserCache,
};

