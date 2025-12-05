// backend/controllers/userController.js

// Unified user controller helpers (kept minimal; main logic lives in routes)
import User from "../models/User.js";

export async function getMe(req, res) {
  const user = await User.findById(req.user.id).select("-password").lean();
  if (!user) return res.status(404).json({ ok: false, message: "User not found" });
  res.json({ ok: true, user });
}
