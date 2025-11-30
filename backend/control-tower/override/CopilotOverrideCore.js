// backend/control-tower/override/CopilotOverrideCore.js

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import crypto from 'crypto';

import { verifyVoiceAccess } from '../security/VerifyVoiceAccess.js';
import { voiceAuthLock } from '../security/VoiceAuthLock.js';
import { executeVoiceCommand } from '../voice/ExecuteCommandWithVoiceCheck.js';
import { logOverrideEvent } from '../../utils/logs/OverrideLogger.js';
import { playSystemVoice } from '../voice/VoiceSample.js';

// Optional: Paths for storing command queue and overrides
const COMMAND_QUEUE_FILE = path.resolve('./backend/data/commandQueue.json');

// Ensure queue file exists
if (!fs.existsSync(COMMAND_QUEUE_FILE)) {
    fs.writeFileSync(COMMAND_QUEUE_FILE, JSON.stringify([]));
}

/**
 * Handles incoming voice commands for PowerStream Override
 * @param {string} userId - The ID of the user issuing the command
 * @param {Buffer} voiceSample - The audio buffer of the command
 * @param {string} spokenCommand - The interpreted text of the command
 */
export const handleVoiceOverride = async (userId, voiceSample, spokenCommand) => {
    try {
        // 🔐 Step 1: Check if the system is locked to owner
        const lockStatus = await voiceAuthLock(userId);
        if (!lockStatus.authorized) {
            logOverrideEvent(userId, `Unauthorized attempt: ${spokenCommand}`);
            return { success: false, message: 'Voice override denied: Not owner or verified user.' };
        }

        // 🔑 Step 2: Verify voice match with Infinity Core Security
        const voiceMatch = await verifyVoiceAccess(userId, voiceSample);
        if (!voiceMatch.match) {
            logOverrideEvent(userId, `Voice mismatch attempt: ${spokenCommand}`);
            return { success: false, message: 'Voice override denied: Voice mismatch.' };
        }

        // 🔍 Step 3: Log verified command
        logOverrideEvent(userId, `Voice override accepted: ${spokenCommand}`);

        // 🔄 Step 4: Store in queue for audit & replay
        const queue = JSON.parse(fs.readFileSync(COMMAND_QUEUE_FILE, 'utf8'));
        queue.push({ userId, command: spokenCommand, time: new Date().toISOString() });
        fs.writeFileSync(COMMAND_QUEUE_FILE, JSON.stringify(queue, null, 2));

        // 🧠 Step 5: Execute command
        const executionResult = await executeVoiceCommand(spokenCommand);

        // 🔊 Step 6: Voice feedback
        await playSystemVoice(`Command executed: ${spokenCommand}`);

        return { success: true, message: `Voice override executed: ${spokenCommand}`, result: executionResult };
    } catch (err) {
        console.error("❌ CopilotOverrideCore Error:", err);
        return { success: false, message: 'Error executing voice override command.' };
    }
};

/**
 * Clears queued commands (Owner only)
 */
export const clearOverrideQueue = async (userId) => {
    const lockStatus = await voiceAuthLock(userId);
    if (!lockStatus.authorized) {
        return { success: false, message: 'Not authorized to clear queue.' };
    }
    fs.writeFileSync(COMMAND_QUEUE_FILE, JSON.stringify([]));
    logOverrideEvent(userId, 'Override queue cleared.');
    return { success: true, message: 'Override queue cleared.' };
};
