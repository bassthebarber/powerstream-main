// frontend/src/voice/VoiceCommandHandler.js
import AiCommandRouter from "../copilot/control-tower/AiCommandRouter";

const VoiceCommandHandler = (commandText) => {
  const actions = {
    navigate: (path) => window.location.href = path,
    startLiveStream: () => alert("🔴 Starting live stream..."),
    stopLiveStream: () => alert("⏹️ Stopping live stream..."),
    enableOverride: () => alert("🚨 Override ENABLED"),
    disableOverride: () => alert("🛑 Override DISABLED")
  };

  AiCommandRouter(commandText, actions);
};

export default VoiceCommandHandler;


