// backend/controllers/authController.js
// DEPRECATED: This controller is part of the LEGACY architecture.
// Runtime traffic is being migrated to /backend/src/api/controllers/auth.controller.js
// Do NOT add new features here.
// NOTE: Current auth routes are implemented directly in `backend/routes/authRoutes.js`
// and return `{ token, user }` for login/register plus `/auth/me` and `/auth/refresh`.
// These controller functions are lightweight wrappers / stubs for potential reuse.

import jwt from "jsonwebtoken";
import { User } from "../src/domain/models/index.js";
import env from "../src/config/env.js";

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

// Example: controller-style login (not currently mounted)
export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.json({ token, user: buildUserPayload(user) });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Internal server error" });
  }
}

// Example: token revalidation / refresh (not currently mounted)
export async function refreshToken(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newToken = signToken(user);
    return res.json({ token: newToken, user: buildUserPayload(user) });
  } catch (e) {
    const name = e?.name;
    if (name === "JsonWebTokenError" || name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(500).json({ message: e.message || "Internal server error" });
  }
}

export { buildUserPayload, signToken };
