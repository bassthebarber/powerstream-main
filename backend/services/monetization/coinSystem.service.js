// backend/services/monetization/coinSystem.service.js
// Coin system service per Overlord Spec
import User from "../../models/User.js";
import CoinTransaction from "../../models/CoinTransaction.js";
import TokenLedger from "../../models/TokenLedger.js";
import { logger } from "../../utils/logger.js";
import eventBus from "../../utils/eventBus.js";

// Default faucet amount (configurable)
const FAUCET_AMOUNT = parseInt(process.env.COIN_FAUCET_AMOUNT) || 10;

const coinService = {
  /**
   * Get user's coin balance
   */
  async getBalance(userId) {
    const user = await User.findById(userId).select("coinsBalance");
    return user?.coinsBalance || 0;
  },

  /**
   * Get transaction history for a user
   */
  async getHistory(userId, options = {}) {
    const { limit = 50, skip = 0 } = options;
    
    return CoinTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },

  /**
   * Send coins from one user to another (tip)
   */
  async sendCoins(senderId, recipientId, amount, options = {}) {
    const { memo, reference } = options;
    
    if (senderId === recipientId) {
      return { success: false, message: "Cannot send coins to yourself", code: "SELF_SEND" };
    }
    
    // Get sender
    const sender = await User.findById(senderId);
    if (!sender) {
      return { success: false, message: "Sender not found", code: "SENDER_NOT_FOUND" };
    }
    
    if ((sender.coinsBalance || 0) < amount) {
      return { success: false, message: "Insufficient balance", code: "INSUFFICIENT_BALANCE" };
    }
    
    // Get recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return { success: false, message: "Recipient not found", code: "RECIPIENT_NOT_FOUND" };
    }
    
    // Update balances
    sender.coinsBalance = (sender.coinsBalance || 0) - amount;
    recipient.coinsBalance = (recipient.coinsBalance || 0) + amount;
    
    await sender.save();
    await recipient.save();
    
    // Record transaction for sender
    const senderTx = await CoinTransaction.create({
      user: senderId,
      type: "tip",
      amount: -amount,
      balanceAfter: sender.coinsBalance,
      reference: reference?.entityId,
      description: memo || `Sent to ${recipient.name}`,
    });
    
    // Record transaction for recipient
    await CoinTransaction.create({
      user: recipientId,
      type: "tip",
      amount: amount,
      balanceAfter: recipient.coinsBalance,
      reference: reference?.entityId,
      description: memo || `Received from ${sender.name}`,
    });
    
    // Record in ledger
    await TokenLedger.addTransaction({
      payload: {
        type: "tip",
        from: senderId,
        to: recipientId,
        amount,
        memo,
        reference,
      },
      balances: {
        from: sender.coinsBalance,
        to: recipient.coinsBalance,
      },
    });
    
    // Emit event
    eventBus.emit("COINS_SENT", {
      senderId,
      recipientId,
      amount,
      memo,
    });
    
    logger.info(`Coins sent: ${amount} from ${senderId} to ${recipientId}`);
    
    return {
      success: true,
      transaction: senderTx,
      senderBalance: sender.coinsBalance,
    };
  },

  /**
   * Claim daily faucet coins
   */
  async claimFaucet(userId) {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found", code: "USER_NOT_FOUND" };
    }
    
    // Check if already claimed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingClaim = await CoinTransaction.findOne({
      user: userId,
      type: "earn",
      description: "Daily faucet",
      createdAt: { $gte: today },
    });
    
    if (existingClaim) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        success: false,
        message: "Already claimed today",
        code: "ALREADY_CLAIMED",
        nextClaimAt: tomorrow,
      };
    }
    
    // Add coins
    const previousBalance = user.coinsBalance || 0;
    user.coinsBalance = previousBalance + FAUCET_AMOUNT;
    await user.save();
    
    // Record transaction
    await CoinTransaction.create({
      user: userId,
      type: "earn",
      amount: FAUCET_AMOUNT,
      balanceAfter: user.coinsBalance,
      description: "Daily faucet",
    });
    
    // Record in ledger
    await TokenLedger.addTransaction({
      payload: {
        type: "earn",
        to: userId,
        amount: FAUCET_AMOUNT,
        memo: "Daily faucet claim",
      },
      balances: {
        from: null,
        to: user.coinsBalance,
      },
    });
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      success: true,
      amount: FAUCET_AMOUNT,
      newBalance: user.coinsBalance,
      nextClaimAt: tomorrow,
    };
  },

  /**
   * Purchase coins with real money
   */
  async purchaseCoins(userId, amount, paymentData) {
    const { paymentMethod, paymentToken } = paymentData;
    
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found", code: "USER_NOT_FOUND" };
    }
    
    // TODO: Integrate with payment provider (PayPal, Stripe, etc.)
    // For now, simulate successful payment
    logger.info(`Processing ${paymentMethod} payment for ${amount} coins`);
    
    // Add coins
    const previousBalance = user.coinsBalance || 0;
    user.coinsBalance = previousBalance + amount;
    await user.save();
    
    // Record transaction
    const transaction = await CoinTransaction.create({
      user: userId,
      type: "purchase",
      amount: amount,
      balanceAfter: user.coinsBalance,
      description: `Purchased via ${paymentMethod}`,
    });
    
    // Record in ledger
    await TokenLedger.addTransaction({
      payload: {
        type: "purchase",
        to: userId,
        amount,
        memo: `Purchase via ${paymentMethod}`,
      },
      balances: {
        from: null,
        to: user.coinsBalance,
      },
    });
    
    return {
      success: true,
      coinsReceived: amount,
      newBalance: user.coinsBalance,
      transactionId: transaction._id,
    };
  },

  /**
   * Admin balance adjustment
   */
  async adminAdjust(userId, amount, adminId, reason) {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found", code: "USER_NOT_FOUND" };
    }
    
    const previousBalance = user.coinsBalance || 0;
    const newBalance = previousBalance + amount;
    
    if (newBalance < 0) {
      return {
        success: false,
        message: "Adjustment would result in negative balance",
        code: "NEGATIVE_BALANCE",
      };
    }
    
    user.coinsBalance = newBalance;
    await user.save();
    
    // Record transaction
    const transaction = await CoinTransaction.create({
      user: userId,
      type: "admin_adjust",
      amount,
      balanceAfter: newBalance,
      description: `Admin adjustment: ${reason}`,
    });
    
    // Record in ledger
    await TokenLedger.addTransaction({
      payload: {
        type: "admin_adjust",
        from: adminId,
        to: userId,
        amount,
        memo: reason,
      },
      balances: {
        from: null,
        to: newBalance,
      },
    });
    
    logger.info(`Admin ${adminId} adjusted ${userId} balance by ${amount}: ${reason}`);
    
    return {
      success: true,
      newBalance,
      transaction,
    };
  },
};

export default coinService;


