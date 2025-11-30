// /backend/core/CopilotEngine.js
import { commandMap } from './CopilotCommandMap.js';
import { logCommand } from './CommandLog.js';

export const executeCommand = async (input, user = 'system') => {
  const command = commandMap[input];

  if (!command) {
    return { success: false, message: 'Unrecognized command' };
  }

  // Log it before execution
  await logCommand({
    command: input,
    system: command.system,
    action: command.action,
    user,
  });

  // This is where you connect the action handlers
  switch (command.action) {
    case 'triggerBroadcast':
      return { success: true, message: 'Broadcast started for NoLimit' };

    case 'systemOverride':
      return { success: true, message: `Override initiated on ${command.system}` };

    case 'lockFanMessages':
      return { success: true, message: 'Fan messages locked' };

    case 'restartSubsystem':
      return { success: true, message: `Restarting ${command.system}` };

    default:
      return { success: false, message: 'Action not implemented' };
  }
};
