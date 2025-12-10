// backend/src/api/routes/auth.routes.js
// Canonical auth routes
import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/refresh", authController.refresh);
router.get("/", authController.health);

// Protected routes
router.get("/me", requireAuth, authController.me);
router.post("/logout", optionalAuth, authController.logout);

export default router;




