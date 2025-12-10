// backend/routes/copilotOverrideRoutes.js
import express from 'express';
import { activateOverrideMode } from '../controllers/copilot/copyilotOverrideActivate.js';

const router = Router();

router.post('/activate', activateOverrideMode);

export default router;
