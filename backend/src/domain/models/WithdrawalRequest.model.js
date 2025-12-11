// backend/src/domain/models/WithdrawalRequest.model.js
// Canonical WithdrawalRequest model for payouts
// Migrated from /backend/models/Withdrawal.js
import mongoose from "mongoose";

/**
 * Withdrawal methods
 */
export const WITHDRAWAL_METHODS = {
  PAYPAL: "paypal",
  BANK_TRANSFER: "bank_transfer",
  STRIPE: "stripe",
  WISE: "wise",
  CRYPTO: "crypto",
  CHECK: "check",
};

/**
 * Withdrawal status
 */
export const WITHDRAWAL_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  APPROVED: "approved",
  COMPLETED: "completed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  FAILED: "failed",
};

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    // ============================================================
    // USER & AMOUNT
    // ============================================================
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
      index: true,
    },
    amount: { 
      type: Number, 
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "CAD", "AUD"],
    },
    
    // Coin equivalent
    coinAmount: { type: Number },
    exchangeRate: { type: Number },

    // ============================================================
    // WITHDRAWAL METHOD
    // ============================================================
    method: { 
      type: String, 
      enum: Object.values(WITHDRAWAL_METHODS),
      default: WITHDRAWAL_METHODS.PAYPAL,
      required: true,
    },
    
    // Method-specific details
    paymentDetails: {
      // PayPal
      paypalEmail: String,
      
      // Bank transfer
      bankName: String,
      accountNumber: String,
      routingNumber: String,
      accountHolder: String,
      swift: String,
      iban: String,
      
      // Crypto
      walletAddress: String,
      network: String, // e.g., "ethereum", "bitcoin"
      
      // Wise
      wiseEmail: String,
      wiseAccountId: String,
    },

    // ============================================================
    // STATUS & TIMESTAMPS
    // ============================================================
    status: { 
      type: String, 
      enum: Object.values(WITHDRAWAL_STATUS),
      default: WITHDRAWAL_STATUS.PENDING,
      index: true,
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    completedAt: { type: Date },
    rejectedAt: { type: Date },

    // ============================================================
    // FEES
    // ============================================================
    fee: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    netAmount: { type: Number }, // Amount user receives after fees

    // ============================================================
    // ADMIN / PROCESSING
    // ============================================================
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // ============================================================
    // NOTES & REASONS
    // ============================================================
    userNote: { type: String, maxlength: 500 },
    adminNote: { type: String, maxlength: 1000 },
    rejectionReason: { type: String },
    failureReason: { type: String },

    // ============================================================
    // TRANSACTION REFERENCE
    // ============================================================
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoinTransaction",
    },
    externalTransactionId: { type: String }, // PayPal/Stripe transaction ID
    confirmationNumber: { type: String },

    // ============================================================
    // VERIFICATION
    // ============================================================
    verification: {
      required: { type: Boolean, default: false },
      type: { type: String, enum: ["email", "phone", "2fa", "manual"] },
      verifiedAt: Date,
      code: String,
    },

    // ============================================================
    // METADATA
    // ============================================================
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { 
    timestamps: true,
    collection: "withdrawal_requests",
  }
);

// ============================================================
// INDEXES
// ============================================================
WithdrawalRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });
WithdrawalRequestSchema.index({ status: 1, requestedAt: -1 });
WithdrawalRequestSchema.index({ externalTransactionId: 1 });

// ============================================================
// PRE-SAVE
// ============================================================
WithdrawalRequestSchema.pre("save", function (next) {
  // Calculate net amount
  if (this.amount && !this.netAmount) {
    this.netAmount = this.amount - (this.fee || 0) - (this.processingFee || 0);
  }
  next();
});

// ============================================================
// METHODS
// ============================================================

// Approve withdrawal
WithdrawalRequestSchema.methods.approve = async function (adminUserId) {
  this.status = WITHDRAWAL_STATUS.APPROVED;
  this.approvedBy = adminUserId;
  await this.save();
  return this;
};

// Start processing
WithdrawalRequestSchema.methods.startProcessing = async function (adminUserId) {
  this.status = WITHDRAWAL_STATUS.PROCESSING;
  this.processedBy = adminUserId;
  this.processedAt = new Date();
  await this.save();
  return this;
};

// Complete withdrawal
WithdrawalRequestSchema.methods.complete = async function (externalTransactionId, confirmationNumber) {
  this.status = WITHDRAWAL_STATUS.COMPLETED;
  this.completedAt = new Date();
  if (externalTransactionId) this.externalTransactionId = externalTransactionId;
  if (confirmationNumber) this.confirmationNumber = confirmationNumber;
  await this.save();
  return this;
};

// Reject withdrawal
WithdrawalRequestSchema.methods.reject = async function (adminUserId, reason) {
  this.status = WITHDRAWAL_STATUS.REJECTED;
  this.rejectedBy = adminUserId;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  await this.save();
  return this;
};

// Cancel withdrawal (by user)
WithdrawalRequestSchema.methods.cancel = async function () {
  if (this.status !== WITHDRAWAL_STATUS.PENDING) {
    throw new Error("Can only cancel pending withdrawals");
  }
  this.status = WITHDRAWAL_STATUS.CANCELLED;
  await this.save();
  return this;
};

// Mark as failed
WithdrawalRequestSchema.methods.fail = async function (reason) {
  this.status = WITHDRAWAL_STATUS.FAILED;
  this.failureReason = reason;
  await this.save();
  return this;
};

// Get summary
WithdrawalRequestSchema.methods.getSummary = function () {
  return {
    id: this._id.toString(),
    amount: this.amount,
    currency: this.currency,
    method: this.method,
    status: this.status,
    netAmount: this.netAmount,
    requestedAt: this.requestedAt,
    completedAt: this.completedAt,
  };
};

// ============================================================
// STATICS
// ============================================================

// Get user's withdrawal history
WithdrawalRequestSchema.statics.getUserHistory = async function (userId, options = {}) {
  const { limit = 20, skip = 0, status } = options;
  
  const query = { userId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Get pending withdrawals (for admin)
WithdrawalRequestSchema.statics.getPending = async function (options = {}) {
  const { limit = 50, skip = 0 } = options;
  
  return this.find({ status: WITHDRAWAL_STATUS.PENDING })
    .sort({ requestedAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name email avatarUrl");
};

// Get user's pending total
WithdrawalRequestSchema.statics.getUserPendingTotal = async function (userId) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: { $in: [WITHDRAWAL_STATUS.PENDING, WITHDRAWAL_STATUS.PROCESSING, WITHDRAWAL_STATUS.APPROVED] },
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
};

// Get analytics
WithdrawalRequestSchema.statics.getAnalytics = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: WITHDRAWAL_STATUS.COMPLETED,
        completedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$method",
        totalAmount: { $sum: "$amount" },
        totalFees: { $sum: "$fee" },
        count: { $sum: 1 },
      },
    },
  ]);
};

const WithdrawalRequest = mongoose.models.WithdrawalRequest || mongoose.model("WithdrawalRequest", WithdrawalRequestSchema);

// Export alias for backwards compatibility
export const Withdrawal = WithdrawalRequest;

export default WithdrawalRequest;
export { WithdrawalRequestSchema };



