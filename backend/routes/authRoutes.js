// backend/routes/authRoutes.js
// DEPRECATED: This route is part of the LEGACY architecture.
// Runtime traffic is being migrated to /backend/src/api/routes/auth.routes.js
// Do NOT add new features here.
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../src/domain/models/index.js";
import env from "../src/config/env.js";

const router = express.Router();

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
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("[LOGIN] attempt", normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`[LOGIN] User not found: ${normalizedEmail}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      console.log(`[LOGIN] Account not active: ${normalizedEmail}, status: ${user.status}`);
      return res.status(401).json({ message: "Account is suspended or banned" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[LOGIN] Password mismatch for: ${normalizedEmail}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`[LOGIN] Success: ${normalizedEmail}`);

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/auth/register
 * Registers a new user
 * Returns JWT token and user data
 */
router.post("/register", async (req, res) => {
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

    res.status(201).json({
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Internal server error" });
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
  res.json({
    status: "ok",
    message: "Auth routes working.",
  });
});

export default router;
