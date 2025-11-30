// backend/routes/paypal.js
import { Router } from 'express';
// import { createOrder, captureOrder } from '../controllers/paymentsController.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, service: 'paypal' }));

// router.post('/create-order', createOrder);
// router.post('/capture-order', captureOrder);

export default router;
