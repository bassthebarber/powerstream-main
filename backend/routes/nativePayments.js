// /backend/routes/nativePayments.js

import express from 'express';
import User from '../models/user.js';
import TokenLedger from '../models/TokenLedger.js';

const router = Router();

// POST /api/coin-payments/native
router.post('/native', async (req, res) => {
  const { userId, platform, token, amount } = req.body;

  try {
    // Optional: Validate token from Apple/Google here
    if (!['apple', 'google'].includes(platform)) {
      return res.status(400).json({ success: false, message: 'Invalid platform' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.coins += amount;
    await user.save();

    await TokenLedger.create({
      from: null,
      to: user._id,
      amount,
      type: `${platform}-native`,
      txHash: token // Placeholder: Store purchase receipt token
    });

    res.json({ success: true, message: 'Coins added via native purchase' });
  } catch (err) {
    console.error('Native payment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
