// backend/src/services/payments/paymentService.js
// Unified Payment Service - Handles all payment providers with graceful degradation

import { features, serviceNotConfiguredResponse } from '../../config/featureFlags.js';
import Stripe from 'stripe';

/**
 * Payment Provider Configuration
 */
const COIN_PACKAGES = [
  { id: 'pack_100', coins: 100, price: 0.99, currency: 'USD', label: '100 Coins' },
  { id: 'pack_500', coins: 500, price: 4.99, currency: 'USD', label: '500 Coins', popular: true },
  { id: 'pack_1000', coins: 1000, price: 9.99, currency: 'USD', label: '1,000 Coins' },
  { id: 'pack_5000', coins: 5000, price: 39.99, currency: 'USD', label: '5,000 Coins', bestValue: true },
  { id: 'pack_10000', coins: 10000, price: 74.99, currency: 'USD', label: '10,000 Coins' },
];

/**
 * Lazy-initialized Stripe client
 */
let stripeClient = null;
function getStripe() {
  if (!features.stripe) return null;
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

/**
 * Get available coin packages
 */
export function getCoinPackages() {
  return COIN_PACKAGES;
}

/**
 * Get payment service status
 */
export function getPaymentStatus() {
  return {
    stripe: {
      enabled: features.stripe,
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test',
    },
    paypal: {
      enabled: features.paypal,
      mode: process.env.PAYPAL_MODE || 'sandbox',
    },
    crypto: {
      enabled: !!process.env.METAMASK_ENABLED,
      networks: ['ethereum', 'polygon'],
    },
    applePay: {
      enabled: features.stripe, // Apple Pay through Stripe
    },
  };
}

/**
 * Check if any payment method is available
 */
export function isPaymentAvailable() {
  return features.stripe || features.paypal;
}

/**
 * Create Stripe checkout session
 */
export async function createStripeCheckout({ userId, packageId, successUrl, cancelUrl }) {
  const stripe = getStripe();
  if (!stripe) {
    return serviceNotConfiguredResponse('Stripe', 'Payment processing is not available.');
  }

  const coinPackage = COIN_PACKAGES.find(p => p.id === packageId);
  if (!coinPackage) {
    return { ok: false, error: 'Invalid package' };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: coinPackage.currency.toLowerCase(),
            product_data: {
              name: `PowerStream ${coinPackage.label}`,
              description: `${coinPackage.coins} PowerStream Coins`,
              images: ['https://powerstream.tv/images/coins-icon.png'],
            },
            unit_amount: Math.round(coinPackage.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL}/coins?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/coins?canceled=true`,
      metadata: {
        userId,
        packageId,
        coins: coinPackage.coins.toString(),
      },
      client_reference_id: userId,
    });

    return { ok: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('[PaymentService] Stripe checkout error:', error.message);
    return { ok: false, error: 'Failed to create checkout session' };
  }
}

/**
 * Verify Stripe webhook event
 */
export function verifyStripeWebhook(payload, signature) {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: 'Stripe not configured' };
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return { ok: true, event };
  } catch (error) {
    console.error('[PaymentService] Webhook verification failed:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Process successful payment
 */
export async function processPaymentSuccess(session) {
  const { userId, coins } = session.metadata;
  const amount = parseInt(coins, 10);

  if (!userId || !amount) {
    console.error('[PaymentService] Invalid session metadata:', session.metadata);
    return { ok: false, error: 'Invalid payment data' };
  }

  try {
    // Dynamic import to avoid circular dependencies
    const { default: User } = await import('../../../models/User.js');
    const { default: CoinTransaction } = await import('../../../models/CoinTransaction.js');

    // Update user balance
    const user = await User.findById(userId);
    if (!user) {
      return { ok: false, error: 'User not found' };
    }

    user.coins = (user.coins || 0) + amount;
    await user.save();

    // Record transaction
    await CoinTransaction.create({
      userId,
      type: 'purchase',
      amount,
      currency: 'USD',
      price: session.amount_total / 100,
      provider: 'stripe',
      providerTransactionId: session.payment_intent,
      status: 'completed',
    });

    console.log(`[PaymentService] Credited ${amount} coins to user ${userId}`);
    return { ok: true, coins: amount, balance: user.coins };
  } catch (error) {
    console.error('[PaymentService] Payment processing error:', error);
    return { ok: false, error: 'Failed to process payment' };
  }
}

export default {
  getCoinPackages,
  getPaymentStatus,
  isPaymentAvailable,
  createStripeCheckout,
  verifyStripeWebhook,
  processPaymentSuccess,
};


