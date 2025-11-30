// /backend/core/VoiceCommandHook.js
import { executeCommand } from './CopilotEngine.js';

export const handleVoiceCommand = async (spokenText, user = 'voice') => {
  const command = spokenText.trim().toLowerCase();
  console.log('🎙️ Voice command received:', command);

  // You could add AI NLP mapping here later
  return await executeCommand(command, user);
};
