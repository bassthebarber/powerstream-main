// backend/controllers/aiCopilotController.js

import CopilotTask from "../models/copilotTask.js";

exports.runCopilotTask = async (req, res) => {
  try {
    const { command, userId } = req.body;

    const task = new CopilotTask({
      command,
      triggeredBy: userId,
      status: 'initiated',
    });

    await task.save();

    // Stub AI behavior
    console.log(`Executing AI Copilot command: ${command}`);

    task.status = 'completed';
    await task.save();

    res.status(200).json({ message: 'AI Copilot task executed', task });
  } catch (error) {
    res.status(500).json({ error: 'AI Copilot failed' });
  }
};
