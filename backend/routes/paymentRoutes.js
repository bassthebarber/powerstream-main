// backend/routes/paymentRoutes.js
// Unified Payment Gateway Routes with graceful degradation

import { Router } from "express";
import { features, serviceNotConfiguredResponse } from "../src/config/featureFlags.js";
import { authRequired } from "../middleware/requireAuth.js";
import paymentService from "../src/services/payments/paymentService.js";

const router = Router();

/**
 * Health check - payment services status
 * GET /api/payments/health
 */
router.get('/health', (req, res) => {
  const status = paymentService.getPaymentStatus();
  res.json({
    ok: true,
    service: 'PowerPay Gateway',
    timestamp: new Date().toISOString(),
    providers: status,
    anyAvailable: paymentService.isPaymentAvailable(),
  });
});

/**
 * Get available payment methods
 * GET /api/payments/methods
 */
router.get('/methods', (req, res) => {
  const status = paymentService.getPaymentStatus();
  res.json({
    ok: true,
    methods: [
      { id: 'card', name: 'Credit/Debit Card', enabled: status.stripe.enabled, icon: '💳' },
      { id: 'paypal', name: 'PayPal', enabled: status.paypal.enabled, icon: '🅿️' },
      { id: 'applepay', name: 'Apple Pay', enabled: status.applePay.enabled, icon: '🍎' },
      { id: 'crypto', name: 'Cryptocurrency', enabled: status.crypto.enabled, icon: '₿' },
    ],
  });
});

/**
 * Get coin packages
 * GET /api/payments/packages
 */
router.get('/packages', (req, res) => {
  res.json({
    ok: true,
    packages: paymentService.getCoinPackages(),
  });
});

/**
 * Create checkout session
 * POST /api/payments/checkout
 */
router.post('/checkout', authRequired, async (req, res) => {
  const { packageId, provider = 'stripe', successUrl, cancelUrl } = req.body;

  if (!paymentService.isPaymentAvailable()) {
    return res.status(503).json(
      serviceNotConfiguredResponse('Payments', 'Payment processing is not configured. Please contact support.')
    );
  }

  if (provider === 'stripe') {
    const result = await paymentService.createStripeCheckout({
      userId: req.user.id,
      packageId,
      successUrl,
      cancelUrl,
    });
    
    if (!result.ok) {
      return res.status(result.code === 'SERVICE_NOT_CONFIGURED' ? 503 : 400).json(result);
    }
    
    return res.json(result);
  }

  if (provider === 'paypal') {
    if (!features.paypal) {
      return res.status(503).json(
        serviceNotConfiguredResponse('PayPal', 'PayPal is not configured.')
      );
    }
    // TODO: Implement PayPal checkout
    return res.status(503).json({
      ok: false,
      code: 'COMING_SOON',
      message: 'PayPal checkout is being finalized. Please use card payment.',
    });
  }

  res.status(400).json({ ok: false, message: 'Invalid payment provider' });
});

/**
 * PayPal payment handler (placeholder)
 * POST /api/payments/paypal
 */
router.post('/paypal', authRequired, (req, res) => {
  if (!features.paypal) {
    return res.status(503).json(
      serviceNotConfiguredResponse('PayPal', 'PayPal payments are not configured.')
    );
  }
  res.status(503).json({
    ok: false,
    code: 'COMING_SOON',
    message: 'PayPal integration coming soon.',
  });
});

/**
 * Apple Pay handler (through Stripe)
 * POST /api/payments/applepay
 */
router.post('/applepay', authRequired, (req, res) => {
  if (!features.stripe) {
    return res.status(503).json(
      serviceNotConfiguredResponse('Apple Pay', 'Apple Pay requires Stripe to be configured.')
    );
  }
  res.json({
    ok: true,
    message: 'Apple Pay is handled through Stripe checkout.',
    useStripeCheckout: true,
  });
});

/**
 * Verify payment success (called after redirect from Stripe)
 * GET /api/payments/verify/:sessionId
 */
router.get('/verify/:sessionId', authRequired, async (req, res) => {
  if (!features.stripe) {
    return res.status(503).json(
      serviceNotConfiguredResponse('Stripe', 'Payment verification unavailable.')
    );
  }

  // TODO: Implement session verification with Stripe
  res.json({
    ok: true,
    message: 'Payment verification endpoint',
    sessionId: req.params.sessionId,
  });
});

export default router;

