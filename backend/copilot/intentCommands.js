// ✅ /backend/copilot/intentCommands.js

module.exports = {
  runIntent(intent) {
    console.log(`[IntentCommands] Executing intent: ${intent}`);
    return { intent, executed: true };
  },
};
