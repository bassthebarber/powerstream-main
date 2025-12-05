// backend/src/api/middleware/auth.middleware.js
// JWT authentication and role-based authorization
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { ApiError } from "../../utils/errors.js";

/**
 * Extract JWT token from request
 */
const extractToken = (req) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  
  // Check cookies (for web clients)
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  
  // Check query param (for specific use cases like WebSocket auth)
  if (req.query?.token) {
    return req.query.token;
  }
  
  return null;
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new ApiError(401, "Authentication required");
    }
    
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role || "user",
      roles: decoded.roles || [decoded.role || "user"],
      coinBalance: decoded.coinBalance || 0,
    };
    
    // Optionally fetch fresh coin balance (for sensitive operations)
    if (req.query?.refreshBalance || req.headers["x-refresh-balance"]) {
      try {
        const User = (await import("../../../models/User.js")).default;
        const user = await User.findById(req.user.id).select("coinBalance roles");
        if (user) {
          req.user.coinBalance = user.coinBalance || 0;
          req.user.roles = user.roles || [decoded.role || "user"];
        }
      } catch (e) {
        // Ignore - use token value
      }
    }
    
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token"));
    }
    next(err);
  }
};

/**
 * Optional authentication
 * Attaches user if token exists, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = {
        id: decoded.id || decoded.userId,
        email: decoded.email,
        role: decoded.role || "user",
        roles: decoded.roles || [decoded.role || "user"],
      };
    }
    
    next();
  } catch (err) {
    // Token invalid but that's okay for optional auth
    logger.debug("Optional auth failed:", err.message);
    next();
  }
};

/**
 * Role-based authorization middleware factory
 * @param {...string} allowedRoles - Roles that are allowed
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }
    
    const userRoles = req.user.roles || [req.user.role];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      logger.warn(`Access denied for user ${req.user.id} - required roles: ${allowedRoles.join(", ")}`);
      return next(new ApiError(403, "Insufficient permissions"));
    }
    
    next();
  };
};

/**
 * Admin only middleware
 */
export const requireAdmin = requireRoles("admin");

/**
 * Station owner or admin
 */
export const requireStationOwner = requireRoles("admin", "stationOwner");

/**
 * Verified user only
 */
export const requireVerified = async (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }
  
  // Get full user from DB to check verification status
  try {
    const User = (await import("../../domain/models/User.model.js")).default;
    const user = await User.findById(req.user.id).select("isVerified status");
    
    if (!user) {
      return next(new ApiError(401, "User not found"));
    }
    
    if (user.status === "suspended" || user.status === "banned") {
      return next(new ApiError(403, `Account ${user.status}`));
    }
    
    if (!user.isVerified) {
      return next(new ApiError(403, "Email verification required"));
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Generate JWT tokens
 */
export const generateTokens = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role || "user",
    roles: user.roles || [user.role || "user"],
  };
  
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  
  const refreshToken = jwt.sign(
    { id: payload.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }
};

// Legacy exports for backwards compatibility with existing code
export const requireAuth = authMiddleware;
export const authRequired = authMiddleware;

export default {
  authMiddleware,
  optionalAuth,
  requireRoles,
  requireAdmin,
  requireStationOwner,
  requireVerified,
  generateTokens,
  verifyRefreshToken,
};

