import express from 'express';
import User from '../models/user.js';
const router = Router();

router.post('/buy', async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);
  user.coins += amount;
  await user.save();
  res.json({ success: true, coins: user.coins });
});

export default router;
