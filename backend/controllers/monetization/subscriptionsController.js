// backend/controllers/monetization/subscriptionsController.js
// Subscriptions controller per Overlord Spec
import { sendSuccess, sendError, sendNotFound, sendCreated } from "../../utils/response.js";
import subscriptionService from "../../services/monetization/subscription.service.js";

/**
 * GET /api/subscriptions/plans
 * Get available subscription plans
 */
export async function getSubscriptionPlans(req, res, next) {
  try {
    const plans = await subscriptionService.getPlans();
    
    return sendSuccess(res, { plans });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/subscriptions/start
 * Start a new subscription
 */
export async function startSubscription(req, res, next) {
  try {
    const userId = req.user.id;
    const { planId, paymentMethod, paymentToken } = req.body;
    
    if (!planId) {
      return sendError(res, "Plan ID is required", 400, "MISSING_PLAN");
    }
    
    const result = await subscriptionService.startSubscription(userId, {
      planId,
      paymentMethod,
      paymentToken,
    });
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendCreated(res, {
      subscription: result.subscription,
    }, "Subscription started successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/subscriptions/cancel
 * Cancel active subscription
 */
export async function cancelSubscription(req, res, next) {
  try {
    const userId = req.user.id;
    const { subscriptionId, reason } = req.body;
    
    if (!subscriptionId) {
      return sendError(res, "Subscription ID is required", 400, "MISSING_SUBSCRIPTION");
    }
    
    const result = await subscriptionService.cancelSubscription(userId, subscriptionId, reason);
    
    if (!result.success) {
      if (result.code === "NOT_FOUND") {
        return sendNotFound(res, result.message);
      }
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, {
      cancellationDate: result.cancellationDate,
      effectiveUntil: result.effectiveUntil,
    }, "Subscription cancelled");
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/subscriptions/my
 * Get user's active subscriptions
 */
export async function getMySubscriptions(req, res, next) {
  try {
    const userId = req.user.id;
    const { includeExpired } = req.query;
    
    const subscriptions = await subscriptionService.getUserSubscriptions(userId, {
      includeExpired: includeExpired === "true",
    });
    
    return sendSuccess(res, { subscriptions });
  } catch (error) {
    next(error);
  }
}

export default {
  getSubscriptionPlans,
  startSubscription,
  cancelSubscription,
  getMySubscriptions,
};


