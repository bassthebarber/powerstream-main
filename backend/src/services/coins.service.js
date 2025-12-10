// backend/src/services/coins.service.js
// Coins service - business logic for PowerCoins
import coinsRepository from "../domain/repositories/coins.repository.js";
import eventsService from "./events.service.js";
import { logger } from "../config/logger.js";
import { EVENT_TYPES, ENTITY_TYPES } from "../domain/models/Event.model.js";
import { TRANSACTION_TYPES, TRANSACTION_STATUS } from "../domain/models/CoinTransaction.model.js";

/**
 * Coins service
 * Handles business logic for PowerCoins transactions
 */
const coinsService = {
  /**
   * Send a tip from one user to another
   */
  async sendTip(fromUserId, toUserId, amount, context = {}) {
    try {
      if (amount <= 0) {
        throw new Error("Tip amount must be positive");
      }

      if (fromUserId.toString() === toUserId.toString()) {
        throw new Error("Cannot tip yourself");
      }

      // Check sender's balance
      const balance = await coinsRepository.getUserBalance(fromUserId);
      if (balance < amount) {
        throw new Error("Insufficient coin balance");
      }

      // Transfer coins
      const { senderBalance, receiverBalance } = await coinsRepository.transferCoins(
        fromUserId,
        toUserId,
        amount
      );

      // Record the transaction
      const transaction = await coinsRepository.recordTip(
        fromUserId,
        toUserId,
        amount,
        context
      );

      // Update balances in transaction
      transaction.fromUserBalanceAfter = senderBalance;
      transaction.toUserBalanceAfter = receiverBalance;
      await transaction.save();

      // Log event
      await eventsService.logCoinTip(
        fromUserId,
        toUserId,
        amount,
        context.type || ENTITY_TYPES.USER,
        context.entityId || toUserId
      );

      logger.info(`Tip sent: ${amount} coins from ${fromUserId} to ${toUserId}`);

      return {
        success: true,
        transaction,
        senderBalance,
        receiverBalance,
      };
    } catch (error) {
      logger.error("Error sending tip:", error);
      throw error;
    }
  },

  /**
   * Process a coin deposit (purchase)
   */
  async processDeposit(userId, amount, paymentDetails) {
    try {
      if (amount <= 0) {
        throw new Error("Deposit amount must be positive");
      }

      // Add coins to user's balance
      const newBalance = await coinsRepository.updateBalance(userId, amount, "add");

      // Record the transaction
      const transaction = await coinsRepository.recordDeposit(userId, amount, {
        ...paymentDetails,
        method: paymentDetails.paymentMethod,
      });

      transaction.toUserBalanceAfter = newBalance;
      await transaction.save();

      logger.info(`Deposit processed: ${amount} coins for user ${userId}`);

      return {
        success: true,
        transaction,
        newBalance,
      };
    } catch (error) {
      logger.error("Error processing deposit:", error);
      throw error;
    }
  },

  /**
   * Get user's coin balance
   */
  async getBalance(userId) {
    try {
      return coinsRepository.getUserBalance(userId);
    } catch (error) {
      logger.error("Error getting balance:", error);
      throw error;
    }
  },

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(userId, options = {}) {
    try {
      return coinsRepository.getUserTransactions(userId, options);
    } catch (error) {
      logger.error("Error getting transaction history:", error);
      throw error;
    }
  },

  /**
   * Get user's earnings summary
   */
  async getEarningsSummary(userId, period = "all") {
    try {
      let startDate, endDate;
      
      if (period !== "all") {
        endDate = new Date();
        startDate = new Date();
        
        if (period === "day") startDate.setDate(startDate.getDate() - 1);
        else if (period === "week") startDate.setDate(startDate.getDate() - 7);
        else if (period === "month") startDate.setMonth(startDate.getMonth() - 1);
        else if (period === "year") startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const earnings = await coinsRepository.getUserEarnings(userId, startDate, endDate);
      const spent = await coinsRepository.getUserSpent(userId, startDate, endDate);
      const balance = await coinsRepository.getUserBalance(userId);

      return {
        balance,
        earnings: earnings.total,
        earningsCount: earnings.count,
        spent: spent.total,
        spentCount: spent.count,
        net: earnings.total - spent.total,
        period,
      };
    } catch (error) {
      logger.error("Error getting earnings summary:", error);
      throw error;
    }
  },

  /**
   * Request a withdrawal
   */
  async requestWithdrawal(userId, amount, method, paymentDetails) {
    try {
      if (amount <= 0) {
        throw new Error("Withdrawal amount must be positive");
      }

      // Check balance
      const balance = await coinsRepository.getUserBalance(userId);
      if (balance < amount) {
        throw new Error("Insufficient balance for withdrawal");
      }

      // Check pending withdrawals
      const pending = await coinsRepository.getUserPendingTotal(userId);
      const availableBalance = balance - pending.total;
      
      if (availableBalance < amount) {
        throw new Error("Amount exceeds available balance after pending withdrawals");
      }

      // Calculate fees (example: 5% platform fee)
      const fee = Math.ceil(amount * 0.05);
      const netAmount = amount - fee;

      // Create withdrawal request
      const withdrawal = await coinsRepository.createWithdrawalRequest({
        userId,
        amount,
        method,
        paymentDetails: {
          paypalEmail: paymentDetails.paypalEmail,
          bankName: paymentDetails.bankName,
          accountNumber: paymentDetails.accountNumber,
          routingNumber: paymentDetails.routingNumber,
        },
        fee,
        netAmount,
        coinAmount: amount,
      });

      // Deduct coins from balance (hold)
      await coinsRepository.updateBalance(userId, amount, "subtract");

      logger.info(`Withdrawal requested: ${amount} coins by user ${userId}`);

      return {
        success: true,
        withdrawal,
        newBalance: balance - amount,
      };
    } catch (error) {
      logger.error("Error requesting withdrawal:", error);
      throw error;
    }
  },

  /**
   * Get user's withdrawal history
   */
  async getWithdrawalHistory(userId, options = {}) {
    try {
      return coinsRepository.getUserWithdrawals(userId, options);
    } catch (error) {
      logger.error("Error getting withdrawal history:", error);
      throw error;
    }
  },

  /**
   * Get pending withdrawals (admin)
   */
  async getPendingWithdrawals(options = {}) {
    try {
      return coinsRepository.getPendingWithdrawals(options);
    } catch (error) {
      logger.error("Error getting pending withdrawals:", error);
      throw error;
    }
  },

  /**
   * Approve a withdrawal (admin)
   */
  async approveWithdrawal(withdrawalId, adminUserId) {
    try {
      return coinsRepository.updateWithdrawalStatus(
        withdrawalId,
        "approved",
        adminUserId
      );
    } catch (error) {
      logger.error("Error approving withdrawal:", error);
      throw error;
    }
  },

  /**
   * Reject a withdrawal (admin)
   */
  async rejectWithdrawal(withdrawalId, adminUserId, reason) {
    try {
      const withdrawal = await coinsRepository.getWithdrawalById(withdrawalId);
      
      if (!withdrawal) {
        throw new Error("Withdrawal not found");
      }

      // Refund coins to user
      await coinsRepository.updateBalance(withdrawal.userId, withdrawal.amount, "add");

      // Update status
      return coinsRepository.updateWithdrawalStatus(
        withdrawalId,
        "rejected",
        adminUserId,
        reason
      );
    } catch (error) {
      logger.error("Error rejecting withdrawal:", error);
      throw error;
    }
  },

  /**
   * Complete a withdrawal (admin)
   */
  async completeWithdrawal(withdrawalId, externalTransactionId) {
    try {
      return coinsRepository.updateWithdrawalStatus(
        withdrawalId,
        "completed",
        null,
        externalTransactionId
      );
    } catch (error) {
      logger.error("Error completing withdrawal:", error);
      throw error;
    }
  },

  /**
   * Get leaderboards
   */
  async getLeaderboards(type = "tippers", period = "week", limit = 10) {
    try {
      if (type === "tippers") {
        return coinsRepository.getTopTippers(limit, period);
      } else if (type === "earners") {
        return coinsRepository.getTopEarners(limit, period);
      }
      throw new Error("Invalid leaderboard type");
    } catch (error) {
      logger.error("Error getting leaderboards:", error);
      throw error;
    }
  },

  /**
   * Get coin packages (pricing)
   */
  getCoinPackages() {
    // These would typically come from a config or database
    return [
      { id: "pkg_100", coins: 100, price: 0.99, currency: "USD", bonus: 0 },
      { id: "pkg_500", coins: 500, price: 4.99, currency: "USD", bonus: 0 },
      { id: "pkg_1000", coins: 1000, price: 9.99, currency: "USD", bonus: 50 },
      { id: "pkg_5000", coins: 5000, price: 44.99, currency: "USD", bonus: 500 },
      { id: "pkg_10000", coins: 10000, price: 84.99, currency: "USD", bonus: 1500 },
    ];
  },

  /**
   * Get exchange rate (coins to USD)
   */
  getExchangeRate() {
    // Example: 100 coins = $1 USD
    return {
      coinsPerDollar: 100,
      minWithdrawal: 1000, // 1000 coins = $10
      maxWithdrawal: 100000, // 100000 coins = $1000
      withdrawalFeePercent: 5,
    };
  },

  // ============================================================
  // Controller-compatible method aliases
  // ============================================================

  /**
   * Get user's coin balance (alias for getBalance)
   */
  async getUserCoinBalance(userId) {
    return this.getBalance(userId);
  },

  /**
   * Send a tip to another user (controller-compatible wrapper)
   */
  async tipUser(fromUserId, toUserId, amount, context = {}) {
    const result = await this.sendTip(fromUserId, toUserId, amount, context);
    return {
      transaction: result.transaction,
      newBalance: result.senderBalance,
    };
  },

  /**
   * Deposit coins (controller-compatible wrapper)
   */
  async depositCoins(userId, amount, details = {}) {
    return this.processDeposit(userId, amount, details);
  },

  /**
   * Withdraw coins (controller-compatible wrapper)
   */
  async withdrawCoins(userId, amount, details = {}) {
    const { method, ...paymentDetails } = details;
    const result = await this.requestWithdrawal(userId, amount, method, paymentDetails);
    return {
      withdrawal: result.withdrawal,
      newBalance: result.newBalance,
    };
  },

  /**
   * Get leaderboard (controller-compatible wrapper)
   */
  async getLeaderboard(options = {}) {
    const { type = "earnings", period = "week", limit = 10 } = options;
    const leaderboardType = type === "earnings" ? "earners" : "tippers";
    return this.getLeaderboards(leaderboardType, period, limit);
  },

  /**
   * Get user stats (controller-compatible wrapper)
   */
  async getUserStats(userId, period = "month") {
    return this.getEarningsSummary(userId, period);
  },
};

export default coinsService;

