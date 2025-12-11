// backend/routes/monetization/subscriptionsRoutes.js
// Subscription management routes per Overlord Spec
import { Router } from "express";
import {
  startSubscription,
  cancelSubscription,
  getMySubscriptions,
  getSubscriptionPlans,
} from "../../controllers/monetization/subscriptionsController.js";
import { requireAuth } from "../../middleware/authMiddleware.js";

const router = Router();

// GET /api/subscriptions/plans - Get available subscription plans (public)
router.get("/plans", getSubscriptionPlans);

// All other routes require authentication
router.use(requireAuth);

// POST /api/subscriptions/start - Start a new subscription
router.post("/start", startSubscription);

// POST /api/subscriptions/cancel - Cancel subscription
router.post("/cancel", cancelSubscription);

// GET /api/subscriptions/my - Get user's active subscriptions
router.get("/my", getMySubscriptions);

export default router;


