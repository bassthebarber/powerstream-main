// backend/src/api/routes/coins.routes.js
// Canonical coins routes (PowerCoins transactions)
import { Router } from "express";
import coinsController from "../controllers/coins.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/pricing", coinsController.getPricing);
router.get("/leaderboard", optionalAuth, coinsController.getLeaderboard);

// Protected routes
router.get("/balance", requireAuth, coinsController.getBalance);
router.get("/transactions", requireAuth, coinsController.getTransactions);
router.get("/withdrawals", requireAuth, coinsController.getWithdrawals);
router.get("/stats", requireAuth, coinsController.getStats);

// Transactions
router.post("/tip", requireAuth, coinsController.sendTip);
router.post("/deposit", requireAuth, coinsController.deposit);
router.post("/withdraw", requireAuth, coinsController.requestWithdrawal);

export default router;

