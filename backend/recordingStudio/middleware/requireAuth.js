// backend/recordingStudio/middleware/requireAuth.js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: "No token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // same secret/public key as main backend
    req.user = payload; // { id, email, role, ... }
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
}
