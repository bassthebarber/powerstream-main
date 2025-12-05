// backend/routes/userRoutes.js
import { Router } from "express";
import User from "../models/User.js";
import { authRequired } from "../middleware/requireAuth.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper: shape user payload for profile
function buildUserProfile(user) {
  return {
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || "",
    roles: Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role || "user"],
    coinBalance: typeof user.coinBalance === "number" ? user.coinBalance : 0,
  };
}

// GET /api/users/me - current user profile
router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password").lean();
  if (!user) return res.status(404).json({ ok: false, message: "User not found" });
  res.json({ ok: true, user: buildUserProfile(user) });
});

// PATCH /api/users/me - update basic fields (name, avatarUrl)
router.patch("/me", authRequired, async (req, res) => {
  const { name, avatarUrl } = req.body || {};
  await User.findByIdAndUpdate(
    req.user.id,
    { $set: { ...(name !== undefined && { name }), ...(avatarUrl !== undefined && { avatarUrl }) } },
    { new: true }
  );
  const user = await User.findById(req.user.id).select("-password").lean();
  res.json({ ok: true, user: buildUserProfile(user) });
});

// POST /api/users/me/avatar - upload avatar and persist URL (stub: echoes filename)
router.post("/me/avatar", authRequired, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "No avatar file provided" });
    }

    // TODO: Replace this with real media upload (e.g., Cloudinary/S3) and get a URL
    const fakeUrl = `/uploads/avatars/${req.file.originalname}`;

    await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatarUrl: fakeUrl } },
      { new: true }
    );

    const user = await User.findById(req.user.id).select("-password").lean();
    res.json({ ok: true, user: buildUserProfile(user) });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ ok: false, message: "Failed to upload avatar" });
  }
});

export default router;
