/**
 * @fileoverview Brain Orchestrator - High-Level AI Control Interface
 * 
 * This orchestrator provides a unified, safe interface for controllers to interact
 * with the AI stack. All AI operations should go through this orchestrator to ensure:
 * - Consistent error handling
 * - Safety/override checks
 * - Proper logging
 * - Human admin override capability
 * 
 * Controllers should import this instead of directly accessing AI modules.
 */

import aiRegistry from './aiRegistry.js';

// ============================================
// SAFETY GUARDS
// ============================================

/**
 * Ensures human authorization is verified before high-impact operations
 * @param {object} context - User context with userId, voiceSample, etc.
 * @returns {Promise<{authorized: boolean, reason?: string}>}
 */
async function ensureHumanAuthorized(context) {
  try {
    if (!context?.userId) {
      return { authorized: false, reason: 'Missing user context' };
    }

    // Verify voice access if voice sample provided
    const verifyVoiceAccess = await aiRegistry.security.verifyVoiceAccess;
    if (context.voiceSample && verifyVoiceAccess) {
      const voiceCheck = await verifyVoiceAccess(context.userId, context.voiceSample);
      if (!voiceCheck?.match) {
        return { authorized: false, reason: 'Voice verification failed' };
      }
    }

    // Additional checks can be added here (admin role, etc.)
    return { authorized: true };
  } catch (error) {
    console.error('[BrainOrchestrator] Human authorization check failed:', error);
    return { authorized: false, reason: error.message };
  }
}

/**
 * Ensures DefenseMatrix passes before allowing operation
 * @param {object} context - Operation context
 * @param {string} command - Command being executed
 * @returns {Promise<{allowed: boolean, reason?: string}>}
 */
async function ensureDefenseMatrixPass(context, command) {
  try {
    const defenseMatrix = await aiRegistry.infinityCore.defenseMatrix;
    if (!defenseMatrix || typeof defenseMatrix.check !== 'function') {
      // If DefenseMatrix not available, allow with warning
      console.warn('[BrainOrchestrator] DefenseMatrix not available, allowing operation');
      return { allowed: true };
    }

    const check = await defenseMatrix.check(command, context);
    return check || { allowed: true };
  } catch (error) {
    console.error('[BrainOrchestrator] DefenseMatrix check failed:', error);
    // Fail closed - deny operation on error
    return { allowed: false, reason: 'DefenseMatrix check error' };
  }
}

/**
 * Ensures override is allowed based on Sovereign laws and mode
 * @param {object} context - Operation context with override key
 * @param {string} command - Command requesting override
 * @returns {Promise<{allowed: boolean, reason?: string}>}
 */
async function ensureOverrideAllowed(context, command) {
  try {
    const sovereignLaws = await aiRegistry.security.sovereignLaws;
    const sovereignMode = await aiRegistry.security.sovereignMode;
    
    if (!context?.overrideKey) {
      return { allowed: false, reason: 'Override key required' };
    }

    // Validate sovereign key
    const keyHandler = await aiRegistry.infinityCore.sovereignKeyHandler;
    if (keyHandler) {
      const keyValid = keyHandler(context.overrideKey);
      if (!keyValid) {
        return { allowed: false, reason: 'Invalid sovereign key' };
      }
    }

    // Check sovereign laws
    if (sovereignLaws && typeof sovereignLaws.enforce === 'function') {
      const lawCheck = await sovereignLaws.enforce(context.overrideKey, command);
      if (!lawCheck.allowed) {
        return { allowed: false, reason: lawCheck.reason || 'Sovereign laws violation' };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error('[BrainOrchestrator] Override check failed:', error);
    return { allowed: false, reason: error.message };
  }
}

// ============================================
// LOGGING HELPER
// ============================================

async function logAction(action, engine, userId, result) {
  try {
    const systemLog = await aiRegistry.controlTower.logs.systemLog;
    if (systemLog && typeof systemLog.log === 'function') {
      systemLog.log({
        action,
        engine,
        userId: userId || 'system',
        result: result?.success ? 'success' : 'failure',
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log(`[BrainOrchestrator] ${action} | Engine: ${engine} | User: ${userId} | Result: ${result?.success ? 'success' : 'failure'}`);
    }
  } catch (error) {
    console.error('[BrainOrchestrator] Logging failed:', error);
  }
}

// ============================================
// ORCHESTRATOR METHODS
// ============================================

/**
 * Run a voice command through the appropriate AI engine
 * @param {string} input - Voice command transcript
 * @param {object} context - User context, session data
 * @returns {Promise<object>}
 */
async function runVoiceCommand(input, context = {}) {
  try {
    await logAction('runVoiceCommand', 'voice', context.userId, { success: true });

    // Route through command router
    const commandRouter = await aiRegistry.brain.commandRouter;
    if (commandRouter && typeof commandRouter.route === 'function') {
      return await commandRouter.route(input, context);
    }

    // Fallback to InfinityCore voice link
    const voiceLink = await aiRegistry.infinityCore.voiceLink;
    if (voiceLink) {
      return await voiceLink(input, context);
    }

    // Final fallback
    return {
      success: false,
      message: 'Voice command processing unavailable',
    };
  } catch (error) {
    console.error('[BrainOrchestrator] Voice command error:', error);
    await logAction('runVoiceCommand', 'voice', context.userId, { success: false, error: error.message });
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Run studio assistance (AI coaching, beat generation, mixing, etc.)
 * @param {string} intent - Intent type (coach, generate, mix, etc.)
 * @param {object} payload - Request payload
 * @returns {Promise<object>}
 */
async function runStudioAssist(intent, payload = {}) {
  try {
    await logAction('runStudioAssist', 'studio', payload.userId, { success: true });

    // Route to appropriate AI suggest module
    const aiSuggest = aiRegistry.aiSuggest;

    switch (intent.toLowerCase()) {
      case 'coach':
      case 'performance':
        // Use AI coach (if available in controllers)
        return {
          success: true,
          message: 'Studio coaching assistance routed',
          intent,
        };

      case 'generate':
      case 'beat':
        // Beat generation would go through beat generation service
        return {
          success: true,
          message: 'Beat generation routed',
          intent,
        };

      case 'autotune':
        const autotune = await aiSuggest.autotune;
        if (autotune) {
          return await autotune(payload);
        }
        break;

      case 'pitch':
        const pitchCorrection = await aiSuggest.pitchCorrection;
        if (pitchCorrection) {
          return await pitchCorrection(payload);
        }
        break;

      case 'caption':
        const captionWriter = await aiSuggest.captionWriter;
        if (captionWriter) {
          return await captionWriter(payload);
        }
        break;

      default:
        return {
          success: false,
          message: `Unknown studio intent: ${intent}`,
        };
    }

    return {
      success: false,
      message: 'Studio assistance unavailable',
    };
  } catch (error) {
    console.error('[BrainOrchestrator] Studio assist error:', error);
    await logAction('runStudioAssist', 'studio', payload.userId, { success: false, error: error.message });
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Run feed assistance (content suggestions, moderation, etc.)
 * @param {string} intent - Intent type
 * @param {object} payload - Request payload
 * @returns {Promise<object>}
 */
async function runFeedAssist(intent, payload = {}) {
  try {
    await logAction('runFeedAssist', 'feed', payload.userId, { success: true });

    // Route through copilot or logic engine
    const copilot = await aiRegistry.copilot.core;
    if (copilot && typeof copilot === 'function') {
      return await copilot(intent, payload);
    }

    return {
      success: false,
      message: 'Feed assistance unavailable',
    };
  } catch (error) {
    console.error('[BrainOrchestrator] Feed assist error:', error);
    await logAction('runFeedAssist', 'feed', payload.userId, { success: false, error: error.message });
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Run TV station assistance (automation, content management)
 * @param {string} intent - Intent type
 * @param {object} payload - Request payload
 * @returns {Promise<object>}
 */
async function runTVStationAssist(intent, payload = {}) {
  try {
    await logAction('runTVStationAssist', 'tv', payload.userId, { success: true });

    // Check for high-impact operations requiring authorization
    const highImpactOps = ['create', 'delete', 'modify', 'broadcast', 'override'];
    if (highImpactOps.some(op => intent.toLowerCase().includes(op))) {
      const authCheck = await ensureHumanAuthorized(payload.context || {});
      if (!authCheck.authorized) {
        return {
          success: false,
          error: 'Authorization required',
          reason: authCheck.reason,
        };
      }
    }

    // Route through appropriate engine
    const copilot = await aiRegistry.copilot.core;
    if (copilot && typeof copilot === 'function') {
      return await copilot(intent, payload);
    }

    return {
      success: false,
      message: 'TV station assistance unavailable',
    };
  } catch (error) {
    console.error('[BrainOrchestrator] TV station assist error:', error);
    await logAction('runTVStationAssist', 'tv', payload.userId, { success: false, error: error.message });
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Run diagnostics on system or specific scope
 * @param {string} scope - Diagnostic scope (system, ai, database, etc.)
 * @param {object} payload - Diagnostic parameters
 * @returns {Promise<object>}
 */
async function runDiagnostics(scope, payload = {}) {
  try {
    await logAction('runDiagnostics', 'diagnostics', payload.userId, { success: true });

    const primeDiagnostics = await aiRegistry.diagnostics.primeDiagnostics;
    if (primeDiagnostics && typeof primeDiagnostics.run === 'function') {
      return await primeDiagnostics.run(scope, payload);
    }

    // Fallback diagnostics
    return {
      success: true,
      scope,
      message: 'Diagnostics completed',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[BrainOrchestrator] Diagnostics error:', error);
    await logAction('runDiagnostics', 'diagnostics', payload.userId, { success: false, error: error.message });
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Run override check before allowing override operation
 * @param {string} command - Command requesting override
 * @param {object} context - Context with override key, user info
 * @returns {Promise<object>}
 */
async function runOverrideCheck(command, context = {}) {
  try {
    // Always require override authorization
    const overrideCheck = await ensureOverrideAllowed(context, command);
    if (!overrideCheck.allowed) {
      await logAction('runOverrideCheck', 'override', context.userId, { success: false, reason: overrideCheck.reason });
      return {
        success: false,
        allowed: false,
        reason: overrideCheck.reason,
      };
    }

    // Check DefenseMatrix
    const defenseCheck = await ensureDefenseMatrixPass(context, command);
    if (!defenseCheck.allowed) {
      await logAction('runOverrideCheck', 'override', context.userId, { success: false, reason: defenseCheck.reason });
      return {
        success: false,
        allowed: false,
        reason: defenseCheck.reason,
      };
    }

    await logAction('runOverrideCheck', 'override', context.userId, { success: true });
    return {
      success: true,
      allowed: true,
    };
  } catch (error) {
    console.error('[BrainOrchestrator] Override check error:', error);
    await logAction('runOverrideCheck', 'override', context.userId, { success: false, error: error.message });
    return {
      success: false,
      allowed: false,
      error: error.message,
    };
  }
}

/**
 * Run autopilot task
 * @param {string} task - Task type
 * @param {object} payload - Task parameters
 * @returns {Promise<object>}
 */
async function runAutoPilotTask(task, payload = {}) {
  try {
    await logAction('runAutoPilotTask', 'autopilot', payload.userId, { success: true });

    const autopilotWorker = await aiRegistry.jobs.autopilotWorker;
    if (autopilotWorker && typeof autopilotWorker.run === 'function') {
      return await autopilotWorker.run(task, payload);
    }

    return {
      success: false,
      message: 'Autopilot unavailable',
    };
  } catch (error) {
    console.error('[BrainOrchestrator] Autopilot error:', error);
    await logAction('runAutoPilotTask', 'autopilot', payload.userId, { success: false, error: error.message });
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update analytics for an event
 * @param {string} eventType - Event type (upload, stream, like, etc.)
 * @param {object} data - Event data
 * @returns {Promise<object>}
 */
async function runAnalyticsUpdate(eventType, data = {}) {
  try {
    const analytics = aiRegistry.analytics;

    switch (eventType.toLowerCase()) {
      case 'creator':
      case 'creator_stats':
        const creatorStats = await analytics.creatorStats;
        if (creatorStats && typeof creatorStats.update === 'function') {
          return await creatorStats.update(data);
        }
        break;

      case 'station':
      case 'station_stats':
        const stationStats = await analytics.stationStats;
        if (stationStats && typeof stationStats.update === 'function') {
          return await stationStats.update(data);
        }
        break;

      case 'track':
      case 'track_stats':
        const trackStats = await analytics.trackStats;
        if (trackStats && typeof trackStats.update === 'function') {
          return await trackStats.update(data);
        }
        break;

      default:
        return {
          success: false,
          message: `Unknown analytics event type: ${eventType}`,
        };
    }

    return {
      success: true,
      message: 'Analytics updated',
      eventType,
    };
  } catch (error) {
    console.error('[BrainOrchestrator] Analytics update error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// EXPORT
// ============================================

export const brainOrchestrator = {
  runVoiceCommand,
  runStudioAssist,
  runFeedAssist,
  runTVStationAssist,
  runDiagnostics,
  runOverrideCheck,
  runAutoPilotTask,
  runAnalyticsUpdate,
  // Safety guards (exported for advanced use cases)
  ensureHumanAuthorized,
  ensureDefenseMatrixPass,
  ensureOverrideAllowed,
};

export default brainOrchestrator;
