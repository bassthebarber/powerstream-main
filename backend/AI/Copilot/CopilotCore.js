import { getIntent } from './CopilotIntentMap.js';
import { executeLogic } from './LogicEngine.js';
import { autoApprove } from './AutoApprover.js';
import { overrideCommand } from './CopilotOverrideCore.js';

export const copilot = async (command, context = {}) => {
  console.log(`🧠 Copilot received command: "${command}"`);

  const intent = getIntent(command);
  if (!intent) {
    return { status: 'error', message: 'Unrecognized command.' };
  }

  if (intent.override) {
    return overrideCommand(intent, context);
  }

  if (intent.autoApprove) {
    const approval = autoApprove(intent, context);
    if (!approval.allowed) {
      return { status: 'denied', message: approval.reason };
    }
  }

  const result = await executeLogic(intent, context);
  return { status: 'success', result };
};
