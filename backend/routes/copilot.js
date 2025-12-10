import express from 'express';
import { handleVoiceCommand } from '../copilot/CopilotOverrideCore.js';

const router = Router();

// POST /copilot/command
router.post('/command', async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'No command provided.' });
  }

  try {
    const result = await handleVoiceCommand(command);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process command.' });
  }
});

export default router;
