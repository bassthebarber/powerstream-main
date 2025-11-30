import { Router } from 'express';
const router = Router();
router.get('/paypal/config', (_req,res)=> res.json({ clientId: process.env.PAYPAL_CLIENT_ID || null }));
// add more providers similarly
export default router;
