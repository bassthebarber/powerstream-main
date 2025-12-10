// backend/controllers/monetization/payoutController.js
// Payout controller per Overlord Spec
import { sendSuccess, sendError, sendNotFound, sendCreated } from "../../utils/response.js";
import payoutService from "../../services/monetization/payout.service.js";

/**
 * POST /api/payouts/request
 * Request a withdrawal/payout
 */
export async function requestPayout(req, res, next) {
  try {
    const userId = req.user.id;
    const { amount, method, details } = req.body;
    
    if (!amount || amount <= 0) {
      return sendError(res, "Valid amount is required", 400, "INVALID_AMOUNT");
    }
    
    if (!method) {
      return sendError(res, "Payout method is required", 400, "MISSING_METHOD");
    }
    
    const validMethods = ["paypal", "bank", "stripe", "cashapp"];
    if (!validMethods.includes(method)) {
      return sendError(
        res,
        `Invalid method. Valid options: ${validMethods.join(", ")}`,
        400,
        "INVALID_METHOD"
      );
    }
    
    const result = await payoutService.createRequest(userId, {
      amount,
      method,
      details,
    });
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendCreated(res, {
      request: result.request,
    }, "Payout request submitted");
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/payouts/my-requests
 * Get user's payout requests
 */
export async function getMyRequests(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, limit = 20, skip = 0 } = req.query;
    
    const requests = await payoutService.getUserRequests(userId, {
      status,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
    
    return sendSuccess(res, {
      requests,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/payouts/:id
 * Cancel a pending payout request
 */
export async function cancelRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const result = await payoutService.cancelRequest(id, userId);
    
    if (!result.success) {
      if (result.code === "NOT_FOUND") {
        return sendNotFound(res, result.message);
      }
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, null, "Payout request cancelled");
  } catch (error) {
    next(error);
  }
}

export default {
  requestPayout,
  getMyRequests,
  cancelRequest,
};


