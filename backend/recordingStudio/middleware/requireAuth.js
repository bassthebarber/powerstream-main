// backend/recordingStudio/middleware/requireAuth.js
// Uses centralized config from /src/config/env.js
import jwt from "jsonwebtoken";
import env from "../../src/config/env.js";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: "No token" });

  try {
    // Use centralized JWT_SECRET from env.js
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload; // { id, email, role, ... }
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
}
