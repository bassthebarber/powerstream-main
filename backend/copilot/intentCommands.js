// ✅ /backend/copilot/intentCommands.js

export function runIntent(intent) {
  console.log(`[IntentCommands] Executing intent: ${intent}`);
  return { intent, executed: true };
}

export default { runIntent };
