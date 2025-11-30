// /backend/controlTower/override/overrideRouter.js

const express = require('express');
const router = express.Router();

const copilotOverrideCore = require('./copilotOverrideCore');
const { start } = require('./commandTrigger.boot');
const { runFamousScan } = require('./copilotPowerFamousScan');
const { activate } = require('./defenseCore');
const { engageFailsafe } = require('./failsafeOverride');
const { link } = require('./sovereignModelLink');
const { heal } = require('./overrideAIHealer');

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

module.exports = router;
