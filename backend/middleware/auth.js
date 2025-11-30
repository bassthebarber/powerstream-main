// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

export function signAccessToken(user) {
  return jwt.sign(
    { _id: user._id.toString(), isAdmin: !!user.isAdmin },
    JWT_SECRET,
    { expiresIn: "7d" } // keep simple
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function authRequired(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: "No token" });

    const decoded = verifyToken(token);
    const user = await User.findById(decoded._id).lean();
    if (!user) return res.status(401).json({ ok: false, error: "Invalid user" });

    req.user = { id: user._id.toString(), isAdmin: !!user.isAdmin, email: user.email, name: user.name };
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
}

export function isAdmin(req, res, next) {
  if (req.user?.isAdmin) return next();
  return res.status(403).json({ ok: false, error: "Admin only" });
}
