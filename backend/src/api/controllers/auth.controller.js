// backend/src/api/controllers/auth.controller.js
// Canonical auth controller - handles authentication endpoints
import jwt from "jsonwebtoken";
import { User } from "../../domain/models/index.js";
import env from "../../config/env.js";
import eventsService from "../../services/events.service.js";
import { logger } from "../../config/logger.js";

/**
 * Build safe user payload for response
 */
function buildUserPayload(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isAdmin: user.isAdmin || user.role === "admin",
    coinBalance: typeof user.coinBalance === "number" ? user.coinBalance : 0,
  };
}

/**
 * Sign JWT token for user
 */
function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

/**
 * Sign refresh token for user
 */
function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    env.JWT_REFRESH_SECRET || env.JWT_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
}

const authController = {
  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const normalizedEmail = email.toLowerCase().trim();
      logger.info(`[AUTH] Login attempt: ${normalizedEmail}`);

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        logger.warn(`[AUTH] Login failed - user not found: ${normalizedEmail}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.status !== "active") {
        logger.warn(`[AUTH] Login failed - inactive account: ${normalizedEmail}`);
        return res.status(401).json({ message: "Account is suspended or banned" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.warn(`[AUTH] Login failed - password mismatch: ${normalizedEmail}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = signToken(user);
      const refreshToken = signRefreshToken(user);

      // Log login event
      await eventsService.logEvent(
        user._id,
        "login",
        "user",
        user._id,
        { method: "email" }
      ).catch(err => logger.warn("Failed to log login event:", err.message));

      logger.info(`[AUTH] Login success: ${normalizedEmail}`);

      return res.status(200).json({
        token,
        refreshToken,
        user: buildUserPayload(user),
      });
    } catch (error) {
      logger.error("Login error:", error);
      next(error);
    }
  },

  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = new User({
        email: normalizedEmail,
        password,
        name: name || "",
        role: "user",
        status: "active",
      });

      await user.save();

      const token = signToken(user);
      const refreshToken = signRefreshToken(user);

      // Log registration event
      await eventsService.logEvent(
        user._id,
        "register",
        "user",
        user._id,
        { method: "email" }
      ).catch(err => logger.warn("Failed to log register event:", err.message));

      logger.info(`[AUTH] Registration success: ${normalizedEmail}`);

      res.status(201).json({
        token,
        refreshToken,
        user: buildUserPayload(user),
      });
    } catch (error) {
      logger.error("Register error:", error);
      if (error.code === 11000) {
        return res.status(400).json({ message: "Email already registered" });
      }
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   */
  async me(req, res, next) {
    try {
      // User is already attached by auth middleware
      const user = await User.findById(req.user.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.status(200).json({ user: buildUserPayload(user) });
    } catch (error) {
      logger.error("Auth me error:", error);
      next(error);
    }
  },

  /**
   * POST /api/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const headerToken = req.headers.authorization?.replace("Bearer ", "");
      const token = refreshToken || headerToken;

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const secret = refreshToken 
        ? (env.JWT_REFRESH_SECRET || env.JWT_SECRET)
        : env.JWT_SECRET;

      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.status !== "active") {
        return res.status(401).json({ message: "Account is suspended" });
      }

      const newToken = signToken(user);
      const newRefreshToken = signRefreshToken(user);

      return res.status(200).json({
        token: newToken,
        refreshToken: newRefreshToken,
        user: buildUserPayload(user),
      });
    } catch (error) {
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      logger.error("Auth refresh error:", error);
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      // Log logout event if user is authenticated
      if (req.user?.id) {
        await eventsService.logEvent(
          req.user.id,
          "logout",
          "user",
          req.user.id,
          {}
        ).catch(err => logger.warn("Failed to log logout event:", err.message));
      }

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/health
   */
  health(req, res) {
    res.json({
      status: "ok",
      message: "Auth routes working",
      version: "2.0",
    });
  },
};

export default authController;




