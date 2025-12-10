import express from 'express';
const router = Router();

router.post('/request', (req, res) => {
  res.json({ message: 'Payout requested.' });
});

export default router;
