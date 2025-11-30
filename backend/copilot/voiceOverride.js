// ✅ /backend/copilot/voiceOverride.js

module.exports = {
  handleVoiceCommand(command) {
    console.log("[VoiceOverride] Received command:", command);
    // Logic to parse and process voice commands
    return { command, processed: true };
  },
};
