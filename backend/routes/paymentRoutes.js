import { Router } from "express";
const router = Router();

router.post('/paypal', (req, res) => {
    res.json({ success: true, message: 'PayPal payment processed' });
});

router.post('/applepay', (req, res) => {
    res.json({ success: true, message: 'Apple Pay processed' });
});

export default router;
