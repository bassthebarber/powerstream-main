// backend/routes/clockinRoutes.js
import express from 'express';
import { clockIn, clockOut, getClockinStatus } from '../controllers/clockingController.js';

const router = express.Router();

router.post('/in', clockIn);
router.post('/out', clockOut);
router.get('/status/:userId', getClockinStatus);

export default router;
