// backend/src/api/controllers/coins.controller.js
// Canonical coins controller - handles PowerCoins transactions
import coinsService from "../../services/coins.service.js";
import eventsService from "../../services/events.service.js";
import { logger } from "../../config/logger.js";

const coinsController = {
  /**
   * GET /api/coins/balance
   * Get current user's coin balance
   */
  async getBalance(req, res, next) {
    try {
      const userId = req.user.id;

      const balance = await coinsService.getUserCoinBalance(userId);

      res.json({
        success: true,
        balance,
        currency: "PowerCoins",
      });
    } catch (error) {
      logger.error("Error getting balance:", error);
      next(error);
    }
  },

  /**
   * GET /api/coins/transactions
   * Get user's transaction history
   */
  async getTransactions(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const type = req.query.type; // filter by type

      const transactions = await coinsService.getTransactionHistory(userId, {
        page,
        limit,
        type,
      });

      res.json({
        success: true,
        transactions,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting transactions:", error);
      next(error);
    }
  },

  /**
   * POST /api/coins/tip
   * Send a tip to another user
   */
  async sendTip(req, res, next) {
    try {
      const userId = req.user.id;
      const { recipientId, amount, message, entityType, entityId } = req.body;

      if (!recipientId || !amount) {
        return res.status(400).json({ message: "Recipient and amount are required" });
      }

      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be positive" });
      }

      if (userId === recipientId) {
        return res.status(400).json({ message: "Cannot tip yourself" });
      }

      const result = await coinsService.tipUser(userId, recipientId, amount, {
        message,
        entityType,
        entityId,
      });

      // Log event
      await eventsService.logEvent(userId, "tip_sent", "coin", null, {
        recipientId,
        amount,
        entityType,
        entityId,
      }).catch(err => logger.warn("Failed to log tip event:", err.message));

      res.json({
        success: true,
        transaction: result.transaction,
        newBalance: result.newBalance,
      });
    } catch (error) {
      logger.error("Error sending tip:", error);
      if (error.message?.includes("Insufficient")) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  },

  /**
   * POST /api/coins/deposit
   * Add coins to user's balance (after payment)
   */
  async deposit(req, res, next) {
    try {
      const userId = req.user.id;
      const { amount, paymentMethod, paymentId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount required" });
      }

      // Note: In production, this should be triggered by a payment webhook
      // This endpoint is for admin/testing or after payment verification
      const result = await coinsService.depositCoins(userId, amount, {
        paymentMethod,
        paymentId,
      });

      res.json({
        success: true,
        transaction: result.transaction,
        newBalance: result.newBalance,
      });
    } catch (error) {
      logger.error("Error depositing coins:", error);
      next(error);
    }
  },

  /**
   * POST /api/coins/withdraw
   * Request a withdrawal
   */
  async requestWithdrawal(req, res, next) {
    try {
      const userId = req.user.id;
      const { amount, method, details } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount required" });
      }

      if (!method) {
        return res.status(400).json({ message: "Withdrawal method required" });
      }

      const result = await coinsService.withdrawCoins(userId, amount, {
        method,
        details,
      });

      res.json({
        success: true,
        withdrawal: result.withdrawal,
        newBalance: result.newBalance,
      });
    } catch (error) {
      logger.error("Error requesting withdrawal:", error);
      if (error.message?.includes("Insufficient") || error.message?.includes("Minimum")) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  },

  /**
   * GET /api/coins/withdrawals
   * Get user's withdrawal history
   */
  async getWithdrawals(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const status = req.query.status;

      const withdrawals = await coinsService.getWithdrawalHistory(userId, {
        page,
        limit,
        status,
      });

      res.json({
        success: true,
        withdrawals,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting withdrawals:", error);
      next(error);
    }
  },

  /**
   * GET /api/coins/leaderboard
   * Get top earners/tippers
   */
  async getLeaderboard(req, res, next) {
    try {
      const type = req.query.type || "earnings"; // earnings, tips, balance
      const period = req.query.period || "week"; // day, week, month, all
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);

      const leaderboard = await coinsService.getLeaderboard({ type, period, limit });

      res.json({
        success: true,
        leaderboard,
        type,
        period,
      });
    } catch (error) {
      logger.error("Error getting leaderboard:", error);
      next(error);
    }
  },

  /**
   * GET /api/coins/stats
   * Get user's coin stats (earnings, spent, etc.)
   */
  async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      const period = req.query.period || "month";

      const stats = await coinsService.getUserStats(userId, period);

      res.json({
        success: true,
        stats,
        period,
      });
    } catch (error) {
      logger.error("Error getting stats:", error);
      next(error);
    }
  },

  /**
   * GET /api/coins/pricing
   * Get coin pricing/packages
   */
  async getPricing(req, res, next) {
    try {
      const pricing = [
        { coins: 100, price: 0.99, currency: "USD", bonus: 0 },
        { coins: 500, price: 4.99, currency: "USD", bonus: 0 },
        { coins: 1000, price: 9.99, currency: "USD", bonus: 50 },
        { coins: 2500, price: 24.99, currency: "USD", bonus: 150 },
        { coins: 5000, price: 49.99, currency: "USD", bonus: 400 },
        { coins: 10000, price: 99.99, currency: "USD", bonus: 1000 },
      ];

      res.json({
        success: true,
        pricing,
        exchangeRate: 0.01, // 1 coin = $0.01 USD
      });
    } catch (error) {
      logger.error("Error getting pricing:", error);
      next(error);
    }
  },
};

export default coinsController;




