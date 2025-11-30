// backend/services/voiceService.js

const VoiceCommand = require('../models/VoiceCommandmodel');
const logUplink = require('../logs/logUplink');
const overrideCore = require('../copilot/overrideCore');

/**
 * Process a voice command issued by user or system.
 * @param {string} transcript - The raw voice input as text
 * @param {object} context - { userId, source, device }
 * @returns {Promise<object>} - Result of override or AI execution
 */
exports.handleVoiceCommand = async (transcript, context = {}) => {
  try {
    const command = transcript.trim().toLowerCase();
    logUplink('VoiceService', 'info', `Voice received: "${command}"`, context);

    // Optionally log or track usage
    const existing = await VoiceCommand.findOne({ command });
    if (existing) {
      existing.usageCount += 1;
      existing.lastUsed = new Date();
      await existing.save();
    } else {
      await new VoiceCommand({
        command,
        description: 'Auto-recorded from voice',
        actionKey: 'pending',
        createdByAI: true,
        owner: context.userId || null,
      }).save();
    }

    // Run through Copilot Override Engine
    const result = await overrideCore.execute(command, context);
    return result;
  } catch (err) {
    logUplink('VoiceService', 'error', 'Voice processing failed', { error: err.message });
    return { success: false, error: err.message };
  }
};

/**
 * Register a voice command manually to the database.
 * Useful for admin or training the system.
 */
exports.registerVoiceCommand = async (data) => {
  const { command, actionKey, description, owner } = data;

  const exists = await VoiceCommand.findOne({ command: command.toLowerCase() });
  if (exists) {
    return { success: false, message: 'Command already exists' };
  }

  const cmd = new VoiceCommand({
    command: command.toLowerCase(),
    actionKey,
    description,
    owner,
  });

  await cmd.save();
  return { success: true, message: 'Voice command registered', cmd };
};
