import { Router } from 'express';
const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    service: 'payments-api',
    providers: {
      paypal: !!process.env.PAYPAL_CLIENT_ID,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    },
    message: 'Payments service ready'
  });
});

// PayPal config
router.get('/paypal/config', (_req, res) => {
  res.json({ 
    clientId: process.env.PAYPAL_CLIENT_ID || null,
    mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
  });
});

// Coin packages
router.get('/packages', (_req, res) => {
  res.json({
    ok: true,
    packages: [
      { id: 'starter', coins: 100, price: 4.99, currency: 'USD', bonus: 0 },
      { id: 'basic', coins: 500, price: 19.99, currency: 'USD', bonus: 50 },
      { id: 'pro', coins: 1000, price: 34.99, currency: 'USD', bonus: 150 },
      { id: 'elite', coins: 2500, price: 79.99, currency: 'USD', bonus: 500 },
    ]
  });
});

// Mock purchase (dev mode)
router.post('/purchase', (req, res) => {
  const { packageId, paymentMethod } = req.body;
  console.log(`[Payments] Purchase request: ${packageId} via ${paymentMethod}`);
  res.json({ 
    ok: true, 
    message: 'Payment processing not configured in development mode',
    orderId: `DEV-${Date.now()}`
  });
});

export default router;
