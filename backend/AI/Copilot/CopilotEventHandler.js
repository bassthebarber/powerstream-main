// /backend/AI/Copilot/CopilotEventHandler.js
const EventBus = require('../../system-core/EventBus');
const CopilotCore = require('./CopilotCore');
const CopilotIntentMap = require('./CopilotIntentMap');

class CopilotEventHandler {
  listen() {
    console.log("📡 [CopilotEventHandler] Listening for Copilot-related events...");

    // Listen for raw intent triggers
    EventBus.on('voice:intent', (intent) => {
      console.log(`🗣️ [CopilotEventHandler] Voice intent detected: ${intent}`);
      const mappedCommand = CopilotIntentMap[intent];
      if (mappedCommand) {
        EventBus.emit('copilot:decision', { command: mappedCommand });
      }
    });

    // Listen for AI requests to override
    EventBus.on('copilot:override', (payload) => {
      console.log("⚡ [CopilotEventHandler] Override request received.");
      CopilotCore.executeOverride(payload);
    });
  }
}

module.exports = new CopilotEventHandler();
