// backend/routes/monetization/adminFinanceRoutes.js
// Admin finance routes per Overlord Spec
import { Router } from "express";
import {
  getFinanceSummary,
  getCoinLedger,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  adjustUserBalance,
  getRevenueReport,
} from "../../controllers/monetization/adminFinanceController.js";
import { requireAuth, requireRole } from "../../middleware/authMiddleware.js";

const router = Router();

// All admin finance routes require authentication and admin/finance role
router.use(requireAuth);
router.use(requireRole("admin", "finance"));

// GET /api/admin/finance/summary - Get overall finance summary
router.get("/summary", getFinanceSummary);

// GET /api/admin/finance/coin-ledger - Get token ledger entries
router.get("/coin-ledger", getCoinLedger);

// GET /api/admin/finance/revenue - Get revenue report
router.get("/revenue", getRevenueReport);

// GET /api/admin/finance/withdrawals - Get all withdrawal requests
router.get("/withdrawals", getAllWithdrawals);

// POST /api/admin/finance/withdrawals/:id/approve - Approve withdrawal
router.post("/withdrawals/:id/approve", approveWithdrawal);

// POST /api/admin/finance/withdrawals/:id/reject - Reject withdrawal
router.post("/withdrawals/:id/reject", rejectWithdrawal);

// POST /api/admin/finance/adjust-balance - Adjust user balance (admin only)
router.post("/adjust-balance", requireRole("admin"), adjustUserBalance);

export default router;



