// backend/controllers/monetization/coinsController.js
// Coin system controller per Overlord Spec
import { sendSuccess, sendError, sendNotFound } from "../../utils/response.js";
import coinService from "../../services/monetization/coinSystem.service.js";

/**
 * GET /api/coins/balance
 * Get current coin balance for authenticated user
 */
export async function getBalance(req, res, next) {
  try {
    const userId = req.user.id;
    const balance = await coinService.getBalance(userId);
    
    return sendSuccess(res, { balance });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/coins/history
 * Get transaction history for authenticated user
 */
export async function getHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { limit = 50, skip = 0 } = req.query;
    
    const history = await coinService.getHistory(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
    
    return sendSuccess(res, { 
      transactions: history,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/coins/send
 * Send coins to another user (tip)
 */
export async function sendCoins(req, res, next) {
  try {
    const senderId = req.user.id;
    const { recipientId, amount, memo, reference } = req.body;
    
    if (!recipientId) {
      return sendError(res, "Recipient ID is required", 400, "MISSING_RECIPIENT");
    }
    
    if (!amount || amount <= 0) {
      return sendError(res, "Valid amount is required", 400, "INVALID_AMOUNT");
    }
    
    const result = await coinService.sendCoins(senderId, recipientId, amount, {
      memo,
      reference,
    });
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, {
      transaction: result.transaction,
      newBalance: result.senderBalance,
    }, "Coins sent successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/coins/faucet
 * Claim daily free coins
 */
export async function faucet(req, res, next) {
  try {
    const userId = req.user.id;
    
    const result = await coinService.claimFaucet(userId);
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, {
      amount: result.amount,
      newBalance: result.newBalance,
      nextClaimAt: result.nextClaimAt,
    }, "Daily coins claimed!");
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/coins/purchase
 * Purchase coins with real money
 */
export async function purchaseCoins(req, res, next) {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod, paymentToken } = req.body;
    
    if (!amount || amount <= 0) {
      return sendError(res, "Valid amount is required", 400, "INVALID_AMOUNT");
    }
    
    if (!paymentMethod) {
      return sendError(res, "Payment method is required", 400, "MISSING_PAYMENT_METHOD");
    }
    
    const result = await coinService.purchaseCoins(userId, amount, {
      paymentMethod,
      paymentToken,
    });
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, {
      coinsReceived: result.coinsReceived,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
    }, "Coins purchased successfully");
  } catch (error) {
    next(error);
  }
}

export default {
  getBalance,
  getHistory,
  sendCoins,
  faucet,
  purchaseCoins,
};


