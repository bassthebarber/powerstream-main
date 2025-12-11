// backend/routes/monetization/coinsRoutes.js
// Coin system routes per Overlord Spec
import { Router } from "express";
import {
  getBalance,
  getHistory,
  sendCoins,
  faucet,
  purchaseCoins,
} from "../../controllers/monetization/coinsController.js";
import { requireAuth } from "../../middleware/authMiddleware.js";
import { rateLimit } from "../../middleware/rateLimit.js";

const router = Router();

// All coin routes require authentication
router.use(requireAuth);

// GET /api/coins/balance - Get current coin balance
router.get("/balance", getBalance);

// GET /api/coins/history - Get transaction history
router.get("/history", getHistory);

// POST /api/coins/send - Send coins (tips)
router.post("/send", sendCoins);

// POST /api/coins/faucet - Daily free coins (rate limited)
router.post(
  "/faucet",
  rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 1 }), // Once per day
  faucet
);

// POST /api/coins/purchase - Purchase coins
router.post("/purchase", purchaseCoins);

export default router;


