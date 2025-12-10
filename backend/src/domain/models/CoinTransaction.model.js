// backend/src/domain/models/CoinTransaction.model.js
// Canonical CoinTransaction model for PowerCoins
// Migrated from /backend/models/CoinTransaction.js
import mongoose from "mongoose";

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
  TIP: "tip",
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
  PURCHASE: "purchase",
  REWARD: "reward",
  REFUND: "refund",
  SUBSCRIPTION: "subscription",
  GIFT: "gift",
  TRANSFER: "transfer",
};

/**
 * Transaction status
 */
export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  STRIPE: "stripe",
  PAYPAL: "paypal",
  APPLE_PAY: "apple_pay",
  GOOGLE_PAY: "google_pay",
  COINS: "coins",
  BANK_TRANSFER: "bank_transfer",
};

const CoinTransactionSchema = new mongoose.Schema(
  {
    // ============================================================
    // TRANSACTION DETAILS
    // ============================================================
    type: { 
      type: String, 
      enum: Object.values(TRANSACTION_TYPES), 
      required: true,
      index: true,
    },
    amount: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    currency: { 
      type: String, 
      default: "POWER", // PowerCoins
      enum: ["POWER", "USD", "EUR", "GBP"],
    },
    
    // Real money equivalent (if applicable)
    fiatAmount: { type: Number },
    fiatCurrency: { type: String },
    exchangeRate: { type: Number },

    // ============================================================
    // PARTIES
    // ============================================================
    fromUserId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      index: true,
    },
    toUserId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      index: true,
    },
    
    // Legacy string fields for backwards compatibility
    fromUserIdString: { type: String },
    toUserIdString: { type: String },

    // ============================================================
    // STATUS
    // ============================================================
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.COMPLETED,
      index: true,
    },

    // ============================================================
    // CONTEXT
    // ============================================================
    // What triggered this transaction
    context: {
      type: { type: String, enum: ["post", "reel", "stream", "station", "subscription", "message", "other"] },
      entityId: { type: mongoose.Schema.Types.ObjectId },
      entityType: { type: String },
    },

    // ============================================================
    // PAYMENT DETAILS
    // ============================================================
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
    },
    paymentDetails: {
      providerId: String,     // Stripe/PayPal transaction ID
      receiptUrl: String,
      cardLast4: String,
      cardBrand: String,
    },

    // ============================================================
    // BALANCES
    // ============================================================
    // Balance snapshots after transaction
    fromUserBalanceAfter: { type: Number },
    toUserBalanceAfter: { type: Number },

    // ============================================================
    // FEES
    // ============================================================
    fee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    netAmount: { type: Number }, // Amount after fees

    // ============================================================
    // METADATA
    // ============================================================
    meta: { 
      type: mongoose.Schema.Types.Mixed, 
      default: {} 
    },
    note: { type: String },
    description: { type: String },
    
    // For refunds
    refundOf: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "CoinTransaction" 
    },
    refundedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "CoinTransaction" 
    },
    refundReason: { type: String },

    // ============================================================
    // TIMESTAMPS
    // ============================================================
    processedAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String },
  },
  { 
    timestamps: true,
    collection: "coin_transactions",
  }
);

// ============================================================
// INDEXES
// ============================================================
CoinTransactionSchema.index({ fromUserId: 1, createdAt: -1 });
CoinTransactionSchema.index({ toUserId: 1, createdAt: -1 });
CoinTransactionSchema.index({ type: 1, status: 1, createdAt: -1 });
CoinTransactionSchema.index({ "context.entityId": 1, "context.type": 1 });
CoinTransactionSchema.index({ "paymentDetails.providerId": 1 });

// ============================================================
// PRE-SAVE
// ============================================================
CoinTransactionSchema.pre("save", function (next) {
  // Calculate net amount
  if (this.amount && !this.netAmount) {
    this.netAmount = this.amount - (this.fee || 0) - (this.platformFee || 0) - (this.processingFee || 0);
  }
  
  // Set processed timestamp
  if (this.status === TRANSACTION_STATUS.COMPLETED && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  // Set failed timestamp
  if (this.status === TRANSACTION_STATUS.FAILED && !this.failedAt) {
    this.failedAt = new Date();
  }
  
  next();
});

// ============================================================
// METHODS
// ============================================================

// Complete transaction
CoinTransactionSchema.methods.complete = async function (balanceAfterFrom, balanceAfterTo) {
  this.status = TRANSACTION_STATUS.COMPLETED;
  this.processedAt = new Date();
  if (balanceAfterFrom !== undefined) this.fromUserBalanceAfter = balanceAfterFrom;
  if (balanceAfterTo !== undefined) this.toUserBalanceAfter = balanceAfterTo;
  await this.save();
  return this;
};

// Fail transaction
CoinTransactionSchema.methods.fail = async function (reason) {
  this.status = TRANSACTION_STATUS.FAILED;
  this.failedAt = new Date();
  this.failureReason = reason;
  await this.save();
  return this;
};

// Create refund
CoinTransactionSchema.methods.refund = async function (reason) {
  const refund = new this.constructor({
    type: TRANSACTION_TYPES.REFUND,
    amount: this.amount,
    currency: this.currency,
    fromUserId: this.toUserId,
    toUserId: this.fromUserId,
    status: TRANSACTION_STATUS.COMPLETED,
    refundOf: this._id,
    refundReason: reason,
    meta: { originalTransaction: this._id },
  });
  
  await refund.save();
  
  // Mark original as refunded
  this.status = TRANSACTION_STATUS.REFUNDED;
  this.refundedBy = refund._id;
  await this.save();
  
  return refund;
};

// Get transaction summary
CoinTransactionSchema.methods.getSummary = function () {
  return {
    id: this._id.toString(),
    type: this.type,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    fromUserId: this.fromUserId,
    toUserId: this.toUserId,
    createdAt: this.createdAt,
  };
};

// ============================================================
// STATICS
// ============================================================

// Get user's transaction history
CoinTransactionSchema.statics.getUserHistory = async function (userId, options = {}) {
  const { limit = 50, skip = 0, type, status } = options;
  
  const query = {
    $or: [{ fromUserId: userId }, { toUserId: userId }],
  };
  
  if (type) query.type = type;
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("fromUserId", "name username avatarUrl")
    .populate("toUserId", "name username avatarUrl");
};

// Get user's total earnings (tips received)
CoinTransactionSchema.statics.getUserEarnings = async function (userId, startDate, endDate) {
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
  
  const result = await this.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  
  return result[0] || { total: 0, count: 0 };
};

// Get user's total spent (tips sent)
CoinTransactionSchema.statics.getUserSpent = async function (userId, startDate, endDate) {
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
  
  const result = await this.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  
  return result[0] || { total: 0, count: 0 };
};

// Find by payment provider ID
CoinTransactionSchema.statics.findByProviderId = function (providerId) {
  return this.findOne({ "paymentDetails.providerId": providerId });
};

const CoinTransaction = mongoose.models.CoinTransaction || mongoose.model("CoinTransaction", CoinTransactionSchema);

export default CoinTransaction;
export { CoinTransactionSchema };




