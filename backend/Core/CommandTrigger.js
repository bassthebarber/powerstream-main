// /backend/core/CommandTrigger.js
import express from 'express';
import { executeCommand } from './CopilotEngine.js';

const router = express.Router();

router.post('/trigger', async (req, res) => {
  const { command, user } = req.body;
  const result = await executeCommand(command, user || 'system');
  res.json(result);
});

export default router;
