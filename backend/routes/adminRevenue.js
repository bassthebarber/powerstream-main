import express from 'express';
import { isAdmin, verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/revenue', verifyToken, isAdmin, async (req, res) => {
  try {
    // Placeholder: Replace with real revenue logic
    const data = {
      totalRevenue: 30000,
      subscriptions: 1200,
      tips: 4800
    };
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

export default router;
