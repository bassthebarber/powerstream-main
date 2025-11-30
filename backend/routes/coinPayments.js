import express from 'express';
const router = Router();

router.post('/webhook', (req, res) => {
  console.log('Payment received', req.body);
  res.status(200).send('OK');
});

export default router;
