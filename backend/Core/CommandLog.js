// /backend/core/CommandLog.js
import CommandLogModel from '../models/CommandLogModel.js';

export const logCommand = async ({ command, system, action, user }) => {
  try {
    const log = new CommandLogModel({
      command,
      system,
      action,
      triggeredBy: user,
    });
    await log.save();
    console.log(`📒 Command logged: ${command}`);
  } catch (err) {
    console.error('❌ Failed to log command:', err.message);
  }
};
