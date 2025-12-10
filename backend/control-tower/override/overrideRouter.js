// /backend/control-tower/override/overrideRouter.js

import { Router } from 'express';
import copilotOverrideCore from './copilotOverrideCore.js';
import { start } from './CommandTriggerBoot.js';
import { runFamousScan } from './copilotPowerFamousScan.js';
import { activate } from './defenseCore.js';
import { engageFailsafe } from './failsafeOverride.js';
import { link } from './sovereignModelLink.js';
import { heal } from './overrideAIHealer.js';

const router = Router();

router.post('/boot', (req, res) => {
  const result = start();
  res.json(result);
});

router.post('/core', copilotOverrideCore);

router.post('/scan', (req, res) => {
  const result = runFamousScan();
  res.json(result);
});

router.post('/defense', (req, res) => {
  const result = activate();
  res.json(result);
});

router.post('/failsafe', (req, res) => {
  const result = engageFailsafe();
  res.json(result);
});

router.post('/sovereign', (req, res) => {
  const result = link();
  res.json(result);
});

router.post('/healer', (req, res) => {
  const result = heal();
  res.json(result);
});

export default router;
