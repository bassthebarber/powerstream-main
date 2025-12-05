import brainOrchestrator from "../AI/brainOrchestrator.js";

export const handleAICommand = async (req, res) => {
  try {
    const { command, voiceSample, intent, payload } = req.body;
    const userId = req.user?.id || req.body?.userId;

    // 🔍 Basic debug log
    console.log("🧠 Brain received command:", command);

    const context = {
      userId,
      voiceSample,
    };

    // Route through orchestrator
    let result;
    if (voiceSample) {
      result = await brainOrchestrator.runVoiceCommand(command, context);
    } else if (intent) {
      // Route based on intent
      if (intent.includes('studio') || intent.includes('audio') || intent.includes('beat')) {
        result = await brainOrchestrator.runStudioAssist(intent, { ...payload, userId });
      } else if (intent.includes('feed') || intent.includes('social')) {
        result = await brainOrchestrator.runFeedAssist(intent, { ...payload, userId });
      } else if (intent.includes('tv') || intent.includes('station')) {
        result = await brainOrchestrator.runTVStationAssist(intent, { ...payload, userId });
      } else {
        result = await brainOrchestrator.runVoiceCommand(command, context);
      }
    } else {
      // Default: route as voice command
      result = await brainOrchestrator.runVoiceCommand(command, context);
    }

    // 🧠 Respond with orchestrator result
    return res.json({
      status: result.success ? "success" : "error",
      message: result.message || `AI Brain received your command: "${command}" and is preparing to execute.`,
      result,
    });
  } catch (err) {
    console.error("Brain Error:", err.message);
    return res
      .status(500)
      .json({ status: "error", message: "Brain malfunction. Check logs." });
  }
};
