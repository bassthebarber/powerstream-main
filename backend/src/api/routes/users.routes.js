// backend/src/api/routes/users.routes.js
// Canonical users routes
import { Router } from "express";
import usersController from "../controllers/users.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Protected routes - current user
router.get("/profile", requireAuth, usersController.getProfile);
router.put("/profile", requireAuth, usersController.updateProfile);
router.get("/suggestions", requireAuth, usersController.getSuggestions);

// Search
router.get("/search", optionalAuth, usersController.searchUsers);

// User by ID
router.get("/:id", optionalAuth, usersController.getUser);
router.get("/:id/followers", optionalAuth, usersController.getFollowers);
router.get("/:id/following", optionalAuth, usersController.getFollowing);

// Follow/Unfollow
router.post("/:id/follow", requireAuth, usersController.followUser);
router.delete("/:id/follow", requireAuth, usersController.unfollowUser);

// Block/Unblock
router.post("/:id/block", requireAuth, usersController.blockUser);
router.delete("/:id/block", requireAuth, usersController.unblockUser);

export default router;




