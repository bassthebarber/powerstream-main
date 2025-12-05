// backend/controllers/aiCopilotController.js

import CopilotTask from "../models/copilotTask.js";
import brainOrchestrator from "../AI/brainOrchestrator.js";

exports.runCopilotTask = async (req, res) => {
  try {
    const { command, userId, intent, payload } = req.body;

    const task = new CopilotTask({
      command,
      triggeredBy: userId,
      status: 'initiated',
    });

    await task.save();

    // Route through orchestrator based on intent
    let result;
    if (intent) {
      // Route to appropriate assist function
      if (intent.includes('feed') || intent.includes('social')) {
        result = await brainOrchestrator.runFeedAssist(intent, { ...payload, userId });
      } else if (intent.includes('tv') || intent.includes('station')) {
        result = await brainOrchestrator.runTVStationAssist(intent, { ...payload, userId });
      } else if (intent.includes('studio') || intent.includes('audio') || intent.includes('beat')) {
        result = await brainOrchestrator.runStudioAssist(intent, { ...payload, userId });
      } else {
        // Default to feed assist
        result = await brainOrchestrator.runFeedAssist(intent, { ...payload, userId });
      }
    } else {
      // Fallback: use voice command handler
      result = await brainOrchestrator.runVoiceCommand(command, { userId });
    }

    task.status = result.success ? 'completed' : 'failed';
    task.result = result;
    await task.save();

    res.status(200).json({ 
      message: 'AI Copilot task executed', 
      task,
      result 
    });
  } catch (error) {
    console.error('AI Copilot error:', error);
    res.status(500).json({ error: 'AI Copilot failed', detail: error.message });
  }
};
