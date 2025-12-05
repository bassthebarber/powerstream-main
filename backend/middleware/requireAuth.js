// backend/middleware/requireAuth.js
// DEPRECATED: This middleware is part of the LEGACY architecture.
// Runtime traffic is being migrated to /backend/src/api/middleware/auth.middleware.js
// Do NOT add new features here.
import jwt from "jsonwebtoken";
import { User } from "../src/domain/models/index.js";
import env from "../src/config/env.js";

/**
 * Middleware to require authentication for protected routes
 * Reads Authorization: Bearer <token> header
 * Verifies JWT and attaches user to req.user
 * Returns 401 if token is missing or invalid
 */
export async function requireAuth(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // Verify token using centralized config
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired",
        });
      }
      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Invalid token",
        });
      }
      throw jwtError;
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(401).json({
        message: "Account is suspended or banned",
      });
    }

    // Attach user to request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin || user.role === "admin",
      coinBalance: user.coinBalance || 0,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * Middleware to require admin role
 * Must be used after requireAuth
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (!req.user.isAdmin && req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
}

// Alias for backward compatibility
export const authRequired = requireAuth;
