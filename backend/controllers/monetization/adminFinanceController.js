// backend/controllers/monetization/adminFinanceController.js
// Admin finance controller per Overlord Spec
import { sendSuccess, sendError, sendNotFound } from "../../utils/response.js";
import coinService from "../../services/monetization/coinSystem.service.js";
import payoutService from "../../services/monetization/payout.service.js";
import TokenLedger from "../../models/TokenLedger.js";
import User from "../../models/User.js";

/**
 * GET /api/admin/finance/summary
 * Get overall finance summary
 */
export async function getFinanceSummary(req, res, next) {
  try {
    // Get total coins in circulation
    const users = await User.find({ isActive: true }).select("coinsBalance");
    const totalCoinsInCirculation = users.reduce((sum, u) => sum + (u.coinsBalance || 0), 0);
    
    // Get pending withdrawals
    const pendingWithdrawals = await payoutService.getPendingCount();
    
    // Get recent transactions
    const recentTransactions = await TokenLedger.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate("payload.from", "name email")
      .populate("payload.to", "name email");
    
    return sendSuccess(res, {
      totalCoinsInCirculation,
      pendingWithdrawals,
      userCount: users.length,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/finance/coin-ledger
 * Get token ledger entries
 */
export async function getCoinLedger(req, res, next) {
  try {
    const { limit = 100, skip = 0, type } = req.query;
    
    const query = {};
    if (type) {
      query["payload.type"] = type;
    }
    
    const entries = await TokenLedger.find(query)
      .sort({ blockNumber: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("payload.from", "name email")
      .populate("payload.to", "name email");
    
    const total = await TokenLedger.countDocuments(query);
    
    return sendSuccess(res, {
      entries,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/finance/revenue
 * Get revenue report
 */
export async function getRevenueReport(req, res, next) {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get purchases in date range
    const purchases = await TokenLedger.find({
      "payload.type": "purchase",
      timestamp: { $gte: start, $lte: end },
    });
    
    const totalRevenue = purchases.reduce((sum, p) => sum + (p.payload.amount || 0), 0);
    
    return sendSuccess(res, {
      startDate: start,
      endDate: end,
      totalRevenue,
      transactionCount: purchases.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/finance/withdrawals
 * Get all withdrawal requests
 */
export async function getAllWithdrawals(req, res, next) {
  try {
    const { status, limit = 50, skip = 0 } = req.query;
    
    const withdrawals = await payoutService.getAllRequests({
      status,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
    
    return sendSuccess(res, { withdrawals });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/finance/withdrawals/:id/approve
 * Approve a withdrawal request
 */
export async function approveWithdrawal(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { notes } = req.body;
    
    const result = await payoutService.approveRequest(id, adminId, notes);
    
    if (!result.success) {
      if (result.code === "NOT_FOUND") {
        return sendNotFound(res, result.message);
      }
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, { request: result.request }, "Withdrawal approved");
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/finance/withdrawals/:id/reject
 * Reject a withdrawal request
 */
export async function rejectWithdrawal(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { reason } = req.body;
    
    if (!reason) {
      return sendError(res, "Rejection reason is required", 400, "MISSING_REASON");
    }
    
    const result = await payoutService.rejectRequest(id, adminId, reason);
    
    if (!result.success) {
      if (result.code === "NOT_FOUND") {
        return sendNotFound(res, result.message);
      }
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, { request: result.request }, "Withdrawal rejected");
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/finance/adjust-balance
 * Manually adjust a user's coin balance
 */
export async function adjustUserBalance(req, res, next) {
  try {
    const adminId = req.user.id;
    const { userId, amount, reason } = req.body;
    
    if (!userId) {
      return sendError(res, "User ID is required", 400, "MISSING_USER");
    }
    
    if (typeof amount !== "number") {
      return sendError(res, "Valid amount is required", 400, "INVALID_AMOUNT");
    }
    
    if (!reason) {
      return sendError(res, "Reason is required", 400, "MISSING_REASON");
    }
    
    const result = await coinService.adminAdjust(userId, amount, adminId, reason);
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, {
      newBalance: result.newBalance,
      transaction: result.transaction,
    }, "Balance adjusted");
  } catch (error) {
    next(error);
  }
}

export default {
  getFinanceSummary,
  getCoinLedger,
  getRevenueReport,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  adjustUserBalance,
};


