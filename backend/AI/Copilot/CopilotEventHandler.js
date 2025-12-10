// backend/AI/Copilot/CopilotEventHandler.js

import EventBus from '../../system-core/EventBus.js';
// Note: These may need to be created as separate modules
// import CopilotCore from './CopilotCore.js';
// import CopilotIntentMap from './CopilotIntentMap.js';

const CopilotIntentMap = {}; // Placeholder

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
      // CopilotCore.executeOverride(payload);
    });
  }
}

const copilotEventHandler = new CopilotEventHandler();
export default copilotEventHandler;
