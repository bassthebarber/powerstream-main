// backend/routes/authRoutes.js
// DEPRECATED: This route is part of the LEGACY architecture.
// Runtime traffic is being migrated to /backend/src/api/routes/auth.routes.js
// Do NOT add new features here.
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../src/domain/models/index.js";
import env from "../src/config/env.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "auth" });
});

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
 * POST /api/auth/login
 * Authenticates a user with email and password
 * Returns JWT token and user data
 */
router.post("/login", async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[LOGIN] ${timestamp} - Request received from ${req.ip || req.connection?.remoteAddress || 'unknown'}`);
  console.log(`[LOGIN] ${timestamp} - Content-Type: ${req.headers['content-type']}`);
  
  try {
    const { email, password } = req.body || {};
    
    console.log(`[LOGIN] ${timestamp} - Body parsed, email present: ${!!email}, password present: ${!!password}`);

    if (!email || !password) {
      console.log(`[LOGIN] ${timestamp} - FAIL: Missing credentials`);
      return res.status(400).json({ 
        message: "Email and password are required",
        error: "MISSING_CREDENTIALS"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[LOGIN] ${timestamp} - Attempting login for: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`[LOGIN] ${timestamp} - FAIL: User not found: ${normalizedEmail}`);
      return res.status(401).json({ 
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS" 
      });
    }

    if (user.status !== "active") {
      console.log(`[LOGIN] ${timestamp} - FAIL: Account not active: ${normalizedEmail}, status: ${user.status}`);
      return res.status(401).json({ 
        message: "Account is suspended or banned",
        error: "ACCOUNT_INACTIVE"
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[LOGIN] ${timestamp} - FAIL: Password mismatch for: ${normalizedEmail}`);
      return res.status(401).json({ 
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS"
      });
    }

    console.log(`[LOGIN] ${timestamp} - SUCCESS: ${normalizedEmail} (user ID: ${user._id})`);

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error(`[LOGIN] ${timestamp} - ERROR:`, error?.message || error);
    console.error(`[LOGIN] ${timestamp} - Stack:`, error?.stack);
    
    // Return a user-friendly error message
    return res.status(500).json({ 
      message: "Login failed. Please try again.",
      error: "SERVER_ERROR"
    });
  }
});

/**
 * POST /api/auth/register
 * Registers a new user
 * Returns JWT token and user data
 */
router.post("/register", async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[REGISTER] ${timestamp} - Request received`);
  
  try {
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      console.log(`[REGISTER] ${timestamp} - FAIL: Missing email or password`);
      return res.status(400).json({ 
        message: "Email and password are required",
        error: "MISSING_CREDENTIALS"
      });
    }
    if (password.length < 6) {
      console.log(`[REGISTER] ${timestamp} - FAIL: Password too short`);
      return res.status(400).json({ 
        message: "Password must be at least 6 characters",
        error: "WEAK_PASSWORD"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[REGISTER] ${timestamp} - Attempting registration for: ${normalizedEmail}`);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log(`[REGISTER] ${timestamp} - FAIL: Email already exists: ${normalizedEmail}`);
      return res.status(400).json({ 
        message: "Email already registered",
        error: "EMAIL_EXISTS"
      });
    }

    const user = new User({
      email: normalizedEmail,
      password,
      name: name || "",
      role: "user",
      status: "active",
    });

    await user.save();
    console.log(`[REGISTER] ${timestamp} - SUCCESS: User created: ${normalizedEmail} (ID: ${user._id})`);

    const token = signToken(user);

    res.status(201).json({
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error(`[REGISTER] ${timestamp} - ERROR:`, error?.message || error);
    console.error(`[REGISTER] ${timestamp} - Stack:`, error?.stack);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Email already registered",
        error: "EMAIL_EXISTS"
      });
    }
    return res.status(500).json({ 
      message: "Registration failed. Please try again.",
      error: "SERVER_ERROR"
    });
  }
});

/**
 * GET /api/auth/me
 * Returns current user from JWT token
 */
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({ user: buildUserPayload(user) });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    console.error("Auth me error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/auth/refresh
 * Optional token refresh endpoint
 * - Validates existing token
 * - Issues a new token and returns { token, user }
 */
router.post("/refresh", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newToken = signToken(user);
    return res.status(200).json({
      token: newToken,
      user: buildUserPayload(user),
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    console.error("Auth refresh error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /
 * Health check for auth routes
 */
router.get("/", (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[AUTH HEALTH] ${timestamp} - Health check requested`);
  res.json({
    status: "ok",
    message: "Auth routes working.",
    timestamp,
    endpoints: ["/login", "/register", "/me", "/refresh"]
  });
});

/**
 * GET /health
 * Alias health check for auth routes
 */
router.get("/health", (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[AUTH HEALTH] ${timestamp} - Health check (alias) requested`);
  res.json({
    status: "ok",
    message: "Auth routes healthy.",
    timestamp
  });
});

export default router;
