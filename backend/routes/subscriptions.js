import express from 'express';
const router = Router();

router.post('/subscribe', (req, res) => {
  res.json({ success: true, message: 'Subscribed successfully.' });
});

export default router;
