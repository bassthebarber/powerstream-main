// backend/src/domain/repositories/coins.repository.js
// Coins repository - data access layer for transactions and balances
import CoinTransaction, { TRANSACTION_TYPES, TRANSACTION_STATUS } from "../models/CoinTransaction.model.js";
import WithdrawalRequest, { WITHDRAWAL_STATUS } from "../models/WithdrawalRequest.model.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";
import { logger } from "../../config/logger.js";

/**
 * Coins repository
 * Handles all data access for PowerCoins transactions
 */
const coinsRepository = {
  // ============================================================
  // TRANSACTIONS
  // ============================================================

  /**
   * Record a coin transaction
   */
  async recordTransaction(data) {
    const transaction = new CoinTransaction(data);
    await transaction.save();
    return transaction;
  },

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId) {
    return CoinTransaction.findById(transactionId)
      .populate("fromUserId", "name username avatarUrl")
      .populate("toUserId", "name username avatarUrl");
  },

  /**
   * Get user's transaction history
   */
  async getUserTransactions(userId, options = {}) {
    const { limit = 50, skip = 0, type, status } = options;

    const query = {
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    };

    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await CoinTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("fromUserId", "name username avatarUrl")
      .populate("toUserId", "name username avatarUrl");

    const total = await CoinTransaction.countDocuments(query);

    return { transactions, total, hasMore: skip + transactions.length < total };
  },

  /**
   * Record a tip
   */
  async recordTip(fromUserId, toUserId, amount, context = {}) {
    const transaction = new CoinTransaction({
      type: TRANSACTION_TYPES.TIP,
      amount,
      fromUserId,
      toUserId,
      context,
      status: TRANSACTION_STATUS.COMPLETED,
      processedAt: new Date(),
    });

    await transaction.save();
    return transaction;
  },

  /**
   * Record a deposit (coin purchase)
   */
  async recordDeposit(userId, amount, paymentDetails = {}) {
    const transaction = new CoinTransaction({
      type: TRANSACTION_TYPES.DEPOSIT,
      amount,
      toUserId: userId,
      paymentMethod: paymentDetails.method,
      paymentDetails,
      fiatAmount: paymentDetails.fiatAmount,
      fiatCurrency: paymentDetails.fiatCurrency,
      status: TRANSACTION_STATUS.COMPLETED,
      processedAt: new Date(),
    });

    await transaction.save();
    return transaction;
  },

  /**
   * Record a withdrawal
   */
  async recordWithdrawal(userId, amount, transactionId) {
    const transaction = new CoinTransaction({
      type: TRANSACTION_TYPES.WITHDRAW,
      amount,
      fromUserId: userId,
      transactionId,
      status: TRANSACTION_STATUS.PENDING,
    });

    await transaction.save();
    return transaction;
  },

  /**
   * Get user's total earnings (tips received)
   */
  async getUserEarnings(userId, startDate, endDate) {
    const match = {
      toUserId: new mongoose.Types.ObjectId(userId),
      type: TRANSACTION_TYPES.TIP,
      status: TRANSACTION_STATUS.COMPLETED,
    };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    const result = await CoinTransaction.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    return result[0] || { total: 0, count: 0 };
  },

  /**
   * Get user's total spent (tips sent)
   */
  async getUserSpent(userId, startDate, endDate) {
    const match = {
      fromUserId: new mongoose.Types.ObjectId(userId),
      type: TRANSACTION_TYPES.TIP,
      status: TRANSACTION_STATUS.COMPLETED,
    };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    const result = await CoinTransaction.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    return result[0] || { total: 0, count: 0 };
  },

  /**
   * Get top tippers (leaderboard)
   */
  async getTopTippers(limit = 10, period = "all") {
    const match = {
      type: TRANSACTION_TYPES.TIP,
      status: TRANSACTION_STATUS.COMPLETED,
    };

    if (period !== "all") {
      const days = period === "day" ? 1 : period === "week" ? 7 : 30;
      match.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }

    return CoinTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$fromUserId",
          totalTipped: { $sum: "$amount" },
          tipCount: { $sum: 1 },
        },
      },
      { $sort: { totalTipped: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          totalTipped: 1,
          tipCount: 1,
          "user.name": 1,
          "user.username": 1,
          "user.avatarUrl": 1,
        },
      },
    ]);
  },

  /**
   * Get top earners
   */
  async getTopEarners(limit = 10, period = "all") {
    const match = {
      type: TRANSACTION_TYPES.TIP,
      status: TRANSACTION_STATUS.COMPLETED,
    };

    if (period !== "all") {
      const days = period === "day" ? 1 : period === "week" ? 7 : 30;
      match.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }

    return CoinTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$toUserId",
          totalEarned: { $sum: "$amount" },
          tipCount: { $sum: 1 },
        },
      },
      { $sort: { totalEarned: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          totalEarned: 1,
          tipCount: 1,
          "user.name": 1,
          "user.username": 1,
          "user.avatarUrl": 1,
        },
      },
    ]);
  },

  // ============================================================
  // BALANCES
  // ============================================================

  /**
   * Get user's coin balance
   */
  async getUserBalance(userId) {
    const user = await User.findById(userId).select("coinBalance");
    return user?.coinBalance || 0;
  },

  /**
   * Update user's coin balance
   */
  async updateBalance(userId, amount, operation = "add") {
    const update = operation === "add" 
      ? { $inc: { coinBalance: amount } }
      : { $inc: { coinBalance: -amount } };

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    return user?.coinBalance || 0;
  },

  /**
   * Transfer coins between users
   */
  async transferCoins(fromUserId, toUserId, amount) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Deduct from sender
      const sender = await User.findByIdAndUpdate(
        fromUserId,
        { $inc: { coinBalance: -amount, totalSpent: amount } },
        { new: true, session }
      );

      if (sender.coinBalance < 0) {
        throw new Error("Insufficient balance");
      }

      // Add to receiver
      const receiver = await User.findByIdAndUpdate(
        toUserId,
        { $inc: { coinBalance: amount, totalEarnings: amount } },
        { new: true, session }
      );

      await session.commitTransaction();

      return {
        senderBalance: sender.coinBalance,
        receiverBalance: receiver.coinBalance,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  // ============================================================
  // WITHDRAWALS
  // ============================================================

  /**
   * Create withdrawal request
   */
  async createWithdrawalRequest(data) {
    const withdrawal = new WithdrawalRequest(data);
    await withdrawal.save();
    return withdrawal;
  },

  /**
   * Get withdrawal request by ID
   */
  async getWithdrawalById(withdrawalId) {
    return WithdrawalRequest.findById(withdrawalId)
      .populate("userId", "name username email avatarUrl");
  },

  /**
   * Get user's withdrawal requests
   */
  async getUserWithdrawals(userId, options = {}) {
    const { limit = 20, skip = 0, status } = options;

    const query = { userId };
    if (status) query.status = status;

    return WithdrawalRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * Get pending withdrawal requests (for admin)
   */
  async getPendingWithdrawals(options = {}) {
    const { limit = 50, skip = 0 } = options;

    return WithdrawalRequest.find({ status: WITHDRAWAL_STATUS.PENDING })
      .sort({ requestedAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email avatarUrl");
  },

  /**
   * Get user's pending withdrawal total
   */
  async getUserPendingTotal(userId) {
    const result = await WithdrawalRequest.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: { $in: [WITHDRAWAL_STATUS.PENDING, WITHDRAWAL_STATUS.PROCESSING] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return result[0] || { total: 0, count: 0 };
  },

  /**
   * Update withdrawal status
   */
  async updateWithdrawalStatus(withdrawalId, status, adminUserId, note) {
    const updates = { status };

    if (status === WITHDRAWAL_STATUS.APPROVED) {
      updates.approvedBy = adminUserId;
    } else if (status === WITHDRAWAL_STATUS.REJECTED) {
      updates.rejectedBy = adminUserId;
      updates.rejectedAt = new Date();
      updates.rejectionReason = note;
    } else if (status === WITHDRAWAL_STATUS.COMPLETED) {
      updates.completedAt = new Date();
    } else if (status === WITHDRAWAL_STATUS.PROCESSING) {
      updates.processedBy = adminUserId;
      updates.processedAt = new Date();
    }

    if (note) updates.adminNote = note;

    return WithdrawalRequest.findByIdAndUpdate(withdrawalId, { $set: updates }, { new: true });
  },

  /**
   * Get platform transaction analytics
   */
  async getTransactionAnalytics(startDate, endDate) {
    return CoinTransaction.aggregate([
      {
        $match: {
          status: TRANSACTION_STATUS.COMPLETED,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          totalFees: { $sum: "$platformFee" },
          count: { $sum: 1 },
        },
      },
    ]);
  },
};

export default coinsRepository;



