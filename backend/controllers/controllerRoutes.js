// /backend/routes/controllerRoutes.js

import express from "express";
import {
  activateControlTower,
  rebootSystemCore,
  lockVisualSensors,
  unlockVisualSensors,
  overrideAIProtocols,
  engageCloakProtocol,
} from "./controlController.js";

const router = Router();

// 🗼 Control Tower Activation
router.post("/tower", activateControlTower);

// 🔁 System Reboot
router.post("/reboot", rebootSystemCore);

// 🔒 Lock Sensors
router.post("/lock-visual", lockVisualSensors);

// 🔓 Unlock Sensors
router.post("/unlock-visual", unlockVisualSensors);

// 🧠 Override AI
router.post("/override", overrideAIProtocols);

// 🕶️ Cloak Mode
router.post("/cloak", engageCloakProtocol);

export default router;

import { saveSnapshot } from '../utils/logs/snapshotLogger.js';

router.post('/trigger', verifyToken, async (req, res) => {
  // ... control logic
  saveSnapshot('controller_triggered', {
    action: req.body.command,
    user: req.user._id,
  });
});
