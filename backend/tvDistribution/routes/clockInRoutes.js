// backend/routes/clockInRoutes.js
import express from 'express';
import { clockInUser } from '../controllers/ClockInController.js';
const router = express.Router();


router.post('/clockin', clockInUser);


export default router;