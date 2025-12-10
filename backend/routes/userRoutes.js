// backend/routes/userRoutes.js
import { Router } from "express";
import User from "../models/User.js";
import { authRequired, authOptional } from "../middleware/requireAuth.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper: shape user payload for profile
function buildUserProfile(user) {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || "",
    roles: Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role || "user"],
    coinBalance: typeof user.coinBalance === "number" ? user.coinBalance : 0,
    followers: user.followers || [],
    following: user.following || [],
  };
}

// ============ SPECIFIC ROUTES FIRST (before :id param catch-all) ============

// GET /api/users/search - search users by name/email for chat
router.get("/search", authRequired, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    const currentUserId = req.user?.id;

    if (!q || q.trim().length < 1) {
      return res.json({ ok: true, users: [] });
    }

    const searchRegex = new RegExp(q.trim(), "i");

    // Search users by name or email, excluding current user
    const query = {
      $and: [
        { _id: { $ne: currentUserId } },
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { displayName: searchRegex },
          ],
        },
      ],
    };

    const users = await User.find(query)
      .select("name displayName email avatarUrl")
      .limit(Number(limit))
      .lean();

    const formattedUsers = users.map((u) => ({
      _id: u._id,
      id: u._id,
      name: u.displayName || u.name,
      email: u.email,
      avatarUrl: u.avatarUrl || "",
    }));

    res.json({ ok: true, users: formattedUsers });
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ ok: false, message: "Failed to search users" });
  }
});

// GET /api/users/suggested - get suggested users to follow
router.get("/suggested", authOptional, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const currentUserId = req.user?.id;

    // Find users that aren't the current user and aren't already followed
    let query = {};
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId).select("following").lean();
      const followingIds = currentUser?.following || [];
      query = {
        _id: { $nin: [currentUserId, ...followingIds] },
      };
    }

    const users = await User.find(query)
      .select("name email avatarUrl role followers")
      .limit(limit)
      .lean();

    const formattedUsers = users.map(u => ({
      _id: u._id,
      id: u._id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl || "",
      role: u.role || "user",
      followers: u.followers || [],
    }));

    res.json({ ok: true, users: formattedUsers });
  } catch (err) {
    console.error("Error fetching suggested users:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch suggested users" });
  }
});

// GET /api/users/me - current user profile
router.get("/me", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });
    res.json({ ok: true, user: buildUserProfile(user) });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch user profile" });
  }
});

// GET /api/users/friends - get user's friends list
router.get("/friends", authOptional, async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.json({ ok: true, friends: [] });
    }

    const user = await User.findById(currentUserId).select("following").lean();
    if (!user?.following?.length) {
      return res.json({ ok: true, friends: [] });
    }

    // Fetch following users separately to avoid populate issues
    const friendUsers = await User.find({ _id: { $in: user.following } })
      .select("name email avatarUrl")
      .lean();

    const friends = friendUsers.map(f => ({
      _id: f._id,
      id: f._id,
      name: f.name,
      email: f.email,
      avatarUrl: f.avatarUrl || "",
      isOnline: Math.random() > 0.5, // Mock online status
    }));

    res.json({ ok: true, friends });
  } catch (err) {
    console.warn("Friends fetch error:", err.message);
    res.json({ ok: true, friends: [] });
  }
});

// GET /api/users/friend-requests - get pending friend requests
router.get("/friend-requests", authOptional, async (req, res) => {
  try {
    // Return empty for now - friend requests feature can be implemented later
    res.json({ ok: true, requests: [], sent: [] });
  } catch (err) {
    res.json({ ok: true, requests: [], sent: [] });
  }
});

// GET /api/users/saved - get user's saved items
router.get("/saved", authOptional, async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.json({ ok: true, saved: [] });
    }

    // Return user's saved posts/items (can be expanded later)
    const user = await User.findById(currentUserId).select("savedPosts").lean();
    res.json({ ok: true, saved: user?.savedPosts || [] });
  } catch (err) {
    res.json({ ok: true, saved: [] });
  }
});

// PATCH /api/users/me - update basic fields (name, avatarUrl)
router.patch("/me", authRequired, async (req, res) => {
  try {
    const { name, avatarUrl } = req.body || {};
    await User.findByIdAndUpdate(
      req.user.id,
      { $set: { ...(name !== undefined && { name }), ...(avatarUrl !== undefined && { avatarUrl }) } },
      { new: true }
    );
    const user = await User.findById(req.user.id).select("-password").lean();
    res.json({ ok: true, user: buildUserProfile(user) });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ ok: false, message: "Failed to update user" });
  }
});

// POST /api/users/me/avatar - upload avatar and persist URL
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

// ============ PARAM ROUTES LAST ============

// GET /api/users/:id - get user by ID (MUST BE AFTER specific routes)
router.get("/:id", authOptional, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });
    res.json({ ok: true, user: buildUserProfile(user) });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch user" });
  }
});

// POST /api/users/:id/follow - follow a user
router.post("/:id/follow", authRequired, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ ok: false, message: "Cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ ok: false, message: "Current user not found" });
    }

    // Initialize arrays if they don't exist
    if (!Array.isArray(currentUser.following)) currentUser.following = [];
    if (!Array.isArray(targetUser.followers)) targetUser.followers = [];

    const isFollowing = currentUser.following.some(id => String(id) === targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => String(id) !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => String(id) !== currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      ok: true,
      following: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (err) {
    console.error("Error following/unfollowing user:", err);
    res.status(500).json({ ok: false, message: "Failed to follow/unfollow user" });
  }
});

export default router;
