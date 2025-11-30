import express from 'express';
import User from '../models/user.js';

const router = Router();

// GET /api/coin-faucet
router.post('/', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Limit airdrop to once per day (optional)
    const now = new Date();
    const lastClaim = user.lastFaucetClaim || new Date(0);
    const hours = Math.abs(now - lastClaim) / 36e5;
    if (hours < 24) {
      return res.status(400).json({ message: 'You can only claim once per day' });
    }

    user.coins += 25; // Airdrop amount
    user.lastFaucetClaim = now;
    await user.save();

    res.json({ message: '25 coins added!', coins: user.coins });
  } catch (err) {
    console.error('Faucet error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
