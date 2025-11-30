// backend/routes/userRoutes.js
import { Router } from "express";
import User from "../models/User.js";
import { authRequired, isAdmin } from "../middleware/auth.js";

const router = Router();

// current user profile
router.get("/me", authRequired, async (req, res) => {
  const u = await User.findById(req.user.id).select("-password").lean();
  res.json({ ok: true, user: u });
});

// update basics
router.patch("/me", authRequired, async (req, res) => {
  const { name, avatarUrl } = req.body || {};
  await User.findByIdAndUpdate(req.user.id, { $set: { name, avatarUrl } }, { new: true });
  const u = await User.findById(req.user.id).select("-password").lean();
  res.json({ ok: true, user: u });
});

// admin: list users
router.get("/", authRequired, isAdmin, async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
  res.json({ ok: true, users });
});

export default router;
