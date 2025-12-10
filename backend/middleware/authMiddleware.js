// backend/middleware/authMiddleware.js
// Unified auth middleware per Overlord Spec
import jwt from 'jsonwebtoken';
import env from '../src/config/env.js';
import { User } from '../src/domain/models/index.js';

/**
 * Middleware to verify JWT token
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token.' 
    });
  }
};

/**
 * Middleware to require authentication
 * Verifies JWT and attaches user to req.user
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id || decoded.sub).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      roles: user.roles || [user.role || "user"],
      isAdmin: user.isAdmin || user.role === "admin" || (user.roles && user.roles.includes("admin")),
      coinsBalance: user.coinsBalance || 0,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Middleware to require specific role(s)
 * Must be used after requireAuth
 * @param {...string} roles - Required roles (any match grants access)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRoles = req.user.roles || [req.user.role || "user"];
    const hasRole = roles.some(role => 
      userRoles.includes(role) || 
      (role === "admin" && req.user.isAdmin)
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
}

/**
 * Middleware to require any of the specified roles
 * Alias for requireRole
 */
export function requireAnyRole(roles) {
  return requireRole(...roles);
}

/**
 * Optional authentication middleware
 * Authenticates if token present, continues otherwise
 */
export async function authOptional(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return next();
    }

    const user = await User.findById(decoded.id || decoded.sub).select("-password");
    if (user) {
      req.user = {
        _id: user._id,
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        roles: user.roles || [user.role || "user"],
        isAdmin: user.isAdmin || user.role === "admin",
        coinsBalance: user.coinsBalance || 0,
      };
    }

    next();
  } catch {
    next();
  }
}

// Aliases for backward compatibility
export const authRequired = requireAuth;
export const requireAdmin = requireRole("admin");

export default verifyToken;
