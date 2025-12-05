// backend/controllers/aiController.js

import brainOrchestrator from "../AI/brainOrchestrator.js";

export async function handleAICommand(req, res) {
  try {
    const { command, voiceSample } = req.body;
    const userId = req.user?.id || req.body?.userId;

    const context = {
      userId,
      voiceSample,
    };

    // Route voice commands through orchestrator
    if (voiceSample || command?.toLowerCase().includes("voice")) {
      const result = await brainOrchestrator.runVoiceCommand(command, context);
      return res.json(result);
    }

    // Handle simple text commands
    let response;

    switch (command?.toLowerCase()) {
      case "hello":
        response = "🧠 PowerStream AI at your service.";
        break;
      case "status":
        // Use diagnostics
        const diagnostics = await brainOrchestrator.runDiagnostics("system", { userId });
        response = diagnostics.success 
          ? "✅ All systems are online and running perfectly."
          : "⚠️ System check incomplete.";
        break;
      case "fix layout":
        response = "🛠️ UI repair initiated. Animating components now.";
        break;
      default:
        // Route through voice command handler as fallback
        const result = await brainOrchestrator.runVoiceCommand(command, context);
        response = result.message || `🤖 Command received: "${command}" — processing...`;
    }

    res.json({ success: true, message: response });
  } catch (error) {
    console.error("AI Command Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
