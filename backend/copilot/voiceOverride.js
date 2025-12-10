// backend/copilot/voiceOverride.js

const voiceOverride = {
  handleVoiceCommand(command) {
    console.log("[VoiceOverride] Received command:", command);
    // Logic to parse and process voice commands
    return { command, processed: true };
  },
};

export default voiceOverride;
