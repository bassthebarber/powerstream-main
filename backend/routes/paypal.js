// backend/routes/paypal.js
// PayPal payment routes with graceful degradation

import { Router } from 'express';
import { features, serviceNotConfiguredResponse } from '../src/config/featureFlags.js';
import { authRequired } from '../middleware/requireAuth.js';

const router = Router();

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'PayPal Payments',
    configured: features.paypal,
    mode: process.env.PAYPAL_MODE || 'sandbox',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Create PayPal order
 * POST /api/paypal/create-order
 */
router.post('/create-order', authRequired, async (req, res) => {
  if (!features.paypal) {
    return res.status(503).json(
      serviceNotConfiguredResponse('PayPal', 'PayPal payments are not configured.')
    );
  }

  const { packageId, amount } = req.body;

  // PayPal SDK would be initialized here
  // For now, return a structured "coming soon" response
  res.status(503).json({
    ok: false,
    code: 'COMING_SOON',
    message: 'PayPal integration is being finalized. Please use card payment.',
  });
});

/**
 * Capture PayPal order
 * POST /api/paypal/capture-order
 */
router.post('/capture-order', authRequired, async (req, res) => {
  if (!features.paypal) {
    return res.status(503).json(
      serviceNotConfiguredResponse('PayPal', 'PayPal payments are not configured.')
    );
  }

  res.status(503).json({
    ok: false,
    code: 'COMING_SOON',
    message: 'PayPal integration is being finalized.',
  });
});

export default router;

