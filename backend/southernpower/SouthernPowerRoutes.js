// SouthernPowerRoutes.js

import express from 'express';
import {
  broadcastSystemMessage,
  restartSubsystem,
  shutdownPlatform,
} from './SouthernPowerController.js';

const router = express.Router();

router.post('/broadcast', broadcastSystemMessage);
router.post('/restart/:subsystem', restartSubsystem);
router.post('/shutdown', shutdownPlatform);

export default router;
