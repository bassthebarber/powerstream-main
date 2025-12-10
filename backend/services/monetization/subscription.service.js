// backend/services/monetization/subscription.service.js
// Subscription service per Overlord Spec
import Subscription from "../../models/Subscriptionmodel.js";
import User from "../../models/User.js";
import { logger } from "../../utils/logger.js";
import eventBus from "../../utils/eventBus.js";

// Default subscription plans
const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 4.99,
    interval: "monthly",
    features: ["Ad-free viewing", "HD streaming"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    interval: "monthly",
    features: ["Ad-free viewing", "4K streaming", "Exclusive content", "Priority support"],
  },
  {
    id: "creator",
    name: "Creator",
    price: 19.99,
    interval: "monthly",
    features: ["All Pro features", "Creator dashboard", "Analytics", "Monetization tools"],
  },
];

const subscriptionService = {
  /**
   * Get available subscription plans
   */
  async getPlans() {
    return SUBSCRIPTION_PLANS;
  },

  /**
   * Start a new subscription
   */
  async startSubscription(userId, data) {
    const { planId, paymentMethod, paymentToken } = data;
    
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      return { success: false, message: "Invalid plan", code: "INVALID_PLAN" };
    }
    
    // Check for existing active subscription
    const existing = await Subscription.findOne({
      user: userId,
      status: "active",
    });
    
    if (existing) {
      return {
        success: false,
        message: "You already have an active subscription",
        code: "ALREADY_SUBSCRIBED",
      };
    }
    
    // TODO: Process payment through payment provider
    logger.info(`Processing subscription payment for plan ${planId}`);
    
    // Calculate renewal date
    const now = new Date();
    const renewalDate = new Date(now);
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    
    // Create subscription
    const subscription = await Subscription.create({
      user: userId,
      planId,
      planName: plan.name,
      price: plan.price,
      status: "active",
      startDate: now,
      renewalDate,
      paymentMethod,
    });
    
    // Update user roles if needed
    const user = await User.findById(userId);
    if (planId === "creator" && !user.roles.includes("creator")) {
      user.roles.push("creator");
      await user.save();
    }
    
    // Emit event
    eventBus.emit("SUBSCRIPTION_STARTED", {
      userId,
      planId,
      subscriptionId: subscription._id,
    });
    
    return {
      success: true,
      subscription,
    };
  },

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId, subscriptionId, reason) {
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: userId,
    });
    
    if (!subscription) {
      return { success: false, message: "Subscription not found", code: "NOT_FOUND" };
    }
    
    if (subscription.status !== "active") {
      return {
        success: false,
        message: "Subscription is not active",
        code: "INVALID_STATUS",
      };
    }
    
    // Mark for cancellation (still active until renewal date)
    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason;
    await subscription.save();
    
    // Emit event
    eventBus.emit("SUBSCRIPTION_CANCELLED", {
      userId,
      subscriptionId,
      reason,
    });
    
    return {
      success: true,
      cancellationDate: subscription.cancelledAt,
      effectiveUntil: subscription.renewalDate,
    };
  },

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(userId, options = {}) {
    const { includeExpired = false } = options;
    
    const query = { user: userId };
    if (!includeExpired) {
      query.status = { $in: ["active", "cancelled"] };
    }
    
    return Subscription.find(query)
      .sort({ createdAt: -1 })
      .lean();
  },

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId, planId = null) {
    const query = {
      user: userId,
      status: "active",
    };
    
    if (planId) {
      query.planId = planId;
    }
    
    const subscription = await Subscription.findOne(query);
    return !!subscription;
  },

  /**
   * Process subscription renewals (called by cron job)
   */
  async processRenewals() {
    const now = new Date();
    
    // Find subscriptions due for renewal
    const dueSubscriptions = await Subscription.find({
      status: "active",
      renewalDate: { $lte: now },
    }).populate("user", "name email");
    
    for (const sub of dueSubscriptions) {
      // TODO: Process renewal payment
      logger.info(`Processing renewal for subscription ${sub._id}`);
      
      // For now, just extend the renewal date
      sub.renewalDate = new Date(now);
      sub.renewalDate.setMonth(sub.renewalDate.getMonth() + 1);
      await sub.save();
    }
    
    return dueSubscriptions.length;
  },
};

export default subscriptionService;


