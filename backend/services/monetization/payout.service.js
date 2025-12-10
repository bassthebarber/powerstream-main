// backend/services/monetization/payout.service.js
// Payout/withdrawal service per Overlord Spec
import Withdrawal from "../../models/Withdrawal.js";
import User from "../../models/User.js";
import CoinTransaction from "../../models/CoinTransaction.js";
import TokenLedger from "../../models/TokenLedger.js";
import { logger } from "../../utils/logger.js";
import eventBus from "../../utils/eventBus.js";

// Minimum withdrawal amount
const MIN_WITHDRAWAL = parseInt(process.env.MIN_WITHDRAWAL_AMOUNT) || 100;

const payoutService = {
  /**
   * Create a new payout request
   */
  async createRequest(userId, data) {
    const { amount, method, details } = data;
    
    if (amount < MIN_WITHDRAWAL) {
      return {
        success: false,
        message: `Minimum withdrawal is ${MIN_WITHDRAWAL} coins`,
        code: "BELOW_MINIMUM",
      };
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found", code: "USER_NOT_FOUND" };
    }
    
    if ((user.coinsBalance || 0) < amount) {
      return { success: false, message: "Insufficient balance", code: "INSUFFICIENT_BALANCE" };
    }
    
    // Check for existing pending request
    const existingPending = await Withdrawal.findOne({
      user: userId,
      status: "pending",
    });
    
    if (existingPending) {
      return {
        success: false,
        message: "You already have a pending withdrawal request",
        code: "PENDING_EXISTS",
      };
    }
    
    // Deduct coins immediately (hold them)
    user.coinsBalance = (user.coinsBalance || 0) - amount;
    await user.save();
    
    // Create withdrawal request
    const request = await Withdrawal.create({
      user: userId,
      amount,
      method,
      status: "pending",
      paymentDetails: details,
    });
    
    // Record transaction (coins held)
    await CoinTransaction.create({
      user: userId,
      type: "spend",
      amount: -amount,
      balanceAfter: user.coinsBalance,
      reference: request._id,
      description: `Withdrawal request - ${method}`,
    });
    
    logger.info(`Withdrawal request created: ${request._id} for ${amount} coins`);
    
    return {
      success: true,
      request,
    };
  },

  /**
   * Get user's payout requests
   */
  async getUserRequests(userId, options = {}) {
    const { status, limit = 20, skip = 0 } = options;
    
    const query = { user: userId };
    if (status) {
      query.status = status;
    }
    
    return Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },

  /**
   * Cancel a pending payout request
   */
  async cancelRequest(requestId, userId) {
    const request = await Withdrawal.findOne({
      _id: requestId,
      user: userId,
    });
    
    if (!request) {
      return { success: false, message: "Request not found", code: "NOT_FOUND" };
    }
    
    if (request.status !== "pending") {
      return {
        success: false,
        message: "Can only cancel pending requests",
        code: "INVALID_STATUS",
      };
    }
    
    // Refund coins
    const user = await User.findById(userId);
    user.coinsBalance = (user.coinsBalance || 0) + request.amount;
    await user.save();
    
    // Update request status
    request.status = "cancelled";
    request.cancelledAt = new Date();
    await request.save();
    
    // Record refund transaction
    await CoinTransaction.create({
      user: userId,
      type: "refund",
      amount: request.amount,
      balanceAfter: user.coinsBalance,
      reference: request._id,
      description: "Withdrawal cancelled - refund",
    });
    
    return { success: true };
  },

  /**
   * Get all payout requests (admin)
   */
  async getAllRequests(options = {}) {
    const { status, limit = 50, skip = 0 } = options;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    return Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .lean();
  },

  /**
   * Get count of pending requests
   */
  async getPendingCount() {
    return Withdrawal.countDocuments({ status: "pending" });
  },

  /**
   * Approve a withdrawal request (admin)
   */
  async approveRequest(requestId, adminId, notes) {
    const request = await Withdrawal.findById(requestId);
    
    if (!request) {
      return { success: false, message: "Request not found", code: "NOT_FOUND" };
    }
    
    if (request.status !== "pending") {
      return {
        success: false,
        message: "Can only approve pending requests",
        code: "INVALID_STATUS",
      };
    }
    
    request.status = "approved";
    request.approvedBy = adminId;
    request.approvedAt = new Date();
    request.notes = notes;
    await request.save();
    
    // Record in ledger
    await TokenLedger.addTransaction({
      payload: {
        type: "burn",
        from: request.user,
        amount: request.amount,
        memo: `Withdrawal approved via ${request.method}`,
        reference: {
          entityType: "withdrawal",
          entityId: request._id,
        },
      },
      balances: {
        from: 0, // Already deducted
        to: null,
      },
    });
    
    // Emit event
    eventBus.emit("WITHDRAWAL_APPROVED", {
      requestId: request._id,
      userId: request.user,
      amount: request.amount,
      method: request.method,
    });
    
    logger.info(`Withdrawal ${requestId} approved by ${adminId}`);
    
    return { success: true, request };
  },

  /**
   * Reject a withdrawal request (admin)
   */
  async rejectRequest(requestId, adminId, reason) {
    const request = await Withdrawal.findById(requestId);
    
    if (!request) {
      return { success: false, message: "Request not found", code: "NOT_FOUND" };
    }
    
    if (request.status !== "pending") {
      return {
        success: false,
        message: "Can only reject pending requests",
        code: "INVALID_STATUS",
      };
    }
    
    // Refund coins
    const user = await User.findById(request.user);
    user.coinsBalance = (user.coinsBalance || 0) + request.amount;
    await user.save();
    
    // Update request
    request.status = "rejected";
    request.rejectedBy = adminId;
    request.rejectedAt = new Date();
    request.rejectionReason = reason;
    await request.save();
    
    // Record refund transaction
    await CoinTransaction.create({
      user: request.user,
      type: "refund",
      amount: request.amount,
      balanceAfter: user.coinsBalance,
      reference: request._id,
      description: `Withdrawal rejected: ${reason}`,
    });
    
    logger.info(`Withdrawal ${requestId} rejected by ${adminId}: ${reason}`);
    
    return { success: true, request };
  },
};

export default payoutService;



