// backend/routes/coinRoutes.js
// PowerStream Coins (PSC) - Virtual currency routes

import { Router } from 'express';
import { buyCoins, tipCreator } from '../controllers/coinController.js';
import { authRequired } from '../middleware/requireAuth.js';
import paymentService from '../src/services/payments/paymentService.js';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';

const router = Router();

/**
 * Health check for coins API
 * GET /api/coins/health
 */
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'PowerStream Coins',
    currency: 'PSC',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get coin packages
 * GET /api/coins/packages
 */
router.get('/packages', (req, res) => {
  const packages = paymentService.getCoinPackages();
  const paymentStatus = paymentService.getPaymentStatus();
  
  res.json({
    ok: true,
    packages,
    paymentMethods: {
      stripe: paymentStatus.stripe.enabled,
      paypal: paymentStatus.paypal.enabled,
      applePay: paymentStatus.applePay.enabled,
    },
  });
});

/**
 * Get user coin balance
 * GET /api/coins/balance
 */
router.get('/balance', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('coins');
    res.json({
      ok: true,
      balance: user?.coins || 0,
      currency: 'PSC',
    });
  } catch (error) {
    console.error('[Coins] Balance error:', error);
    res.status(500).json({ ok: false, message: 'Failed to get balance' });
  }
});

/**
 * Buy coins (mock payment for dev)
 * POST /api/coins/buy
 */
router.post('/buy', authRequired, buyCoins);

/**
 * Create checkout session for coins
 * POST /api/coins/checkout
 */
router.post('/checkout', authRequired, async (req, res) => {
  const { packageId, provider = 'stripe' } = req.body;

  if (provider === 'stripe') {
    const result = await paymentService.createStripeCheckout({
      userId: req.user.id,
      packageId,
    });
    
    if (!result.ok) {
      return res.status(result.code === 'SERVICE_NOT_CONFIGURED' ? 503 : 400).json(result);
    }
    
    return res.json(result);
  }

  res.status(400).json({ ok: false, message: 'Invalid payment provider' });
});

/**
 * Tip a creator
 * POST /api/coins/tip
 */
router.post('/tip', authRequired, tipCreator);

/**
 * Send coins to another user
 * POST /api/coins/send
 */
router.post('/send', authRequired, async (req, res) => {
  const { toUserId, amount, message } = req.body;
  const senderId = req.user.id;

  if (!toUserId || !amount || amount <= 0) {
    return res.status(400).json({ ok: false, message: 'Invalid recipient or amount' });
  }

  try {
    const sender = await User.findById(senderId);
    const recipient = await User.findById(toUserId);

    if (!sender) {
      return res.status(404).json({ ok: false, message: 'Sender not found' });
    }
    if (!recipient) {
      return res.status(404).json({ ok: false, message: 'Recipient not found' });
    }
    if ((sender.coins || 0) < amount) {
      return res.status(400).json({ ok: false, message: 'Insufficient balance' });
    }

    // Transfer coins
    sender.coins = (sender.coins || 0) - amount;
    recipient.coins = (recipient.coins || 0) + amount;
    
    await Promise.all([sender.save(), recipient.save()]);

    // Record transactions
    await CoinTransaction.create([
      {
        userId: senderId,
        type: 'send',
        amount: -amount,
        relatedUserId: toUserId,
        message,
        status: 'completed',
      },
      {
        userId: toUserId,
        type: 'receive',
        amount,
        relatedUserId: senderId,
        message,
        status: 'completed',
      },
    ]);

    res.json({
      ok: true,
      sent: amount,
      balance: sender.coins,
      recipientUsername: recipient.username,
    });
  } catch (error) {
    console.error('[Coins] Send error:', error);
    res.status(500).json({ ok: false, message: 'Transfer failed' });
  }
});

/**
 * Get transaction history
 * GET /api/coins/history
 */
router.get('/history', authRequired, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  try {
    const transactions = await CoinTransaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('relatedUserId', 'username avatar');

    const total = await CoinTransaction.countDocuments({ userId: req.user.id });

    res.json({
      ok: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Coins] History error:', error);
    res.status(500).json({ ok: false, message: 'Failed to get history' });
  }
});

export default router;

