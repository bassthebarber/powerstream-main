/**
 * @fileoverview Central AI Registry - Single Source of Truth
 * 
 * This is the central registry of all AI, control, security, and monitoring engines
 * for the PowerStream platform. This registry should be the SINGLE source of truth
 * for any controller or route that needs AI assistance, analytics, overrides, or safety checks.
 * 
 * All AI modules are organized by domain and exported through this registry to ensure
 * consistent access patterns and enable centralized safety/override controls.
 * 
 * Human admin must always remain the ultimate override through security layers.
 * 
 * NOTE: Modules are loaded lazily on first access. Use await when accessing registry properties.
 * Example: const copilot = await aiRegistry.copilot.core;
 */

// Cache for loaded modules
const moduleCache = new Map();

// Helper to load module with caching
async function loadModule(path, exportName = null) {
  const cacheKey = `${path}:${exportName || 'default'}`;
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  try {
    const mod = await import(path);
    let result;
    if (exportName) {
      result = mod[exportName] || mod.default?.[exportName] || mod.default || mod;
    } else {
      result = mod.default || mod;
    }
    moduleCache.set(cacheKey, result);
    return result;
  } catch (e) {
    console.warn(`[aiRegistry] Failed to load ${path}:`, e.message);
    moduleCache.set(cacheKey, null);
    return null;
  }
}

// Registry structure with async loaders
export const aiRegistry = {
  blackOps: {
    get core() { return loadModule('./BlackOps/BlackOpsCore.js'); },
    get failSafe() { return loadModule('./BlackOps/BlackOpsFailSafe.js'); },
    get missionPlanner() { return loadModule('./BlackOps/BlackOpsMissionPlanner.js'); },
    get override() { return loadModule('./BlackOps/BlackOpsOverride.js'); },
  },

  copilot: {
    get core() { return loadModule('./Copilot/CopilotCore.js', 'copilot'); },
    get bridge() { return loadModule('./Copilot/CopilotBridge.js'); },
    get eventHandler() { return loadModule('./Copilot/CopilotEventHandler.js'); },
    get intentMap() { return loadModule('./Copilot/CopilotIntentMap.js'); },
    get overrideCore() { return loadModule('./Copilot/CopilotOverrideCore.js'); },
    get logicEngine() { return loadModule('./Copilot/LogicEngine.js'); },
    get autoApprover() { return loadModule('./Copilot/AutoApprover.js'); },
  },

  infinityCore: {
    get core() { return loadModule('./InfinityCore/InfinityCore.js'); },
    get commandRouter() { return loadModule('./InfinityCore/InfinityCommandRouter.js'); },
    get failsafe() { return loadModule('./InfinityCore/InfinityFailsafe.js'); },
    get memory() { return loadModule('./InfinityCore/InfinityMemory.js'); },
    get override() { return loadModule('./InfinityCore/InfinityOverride.js'); },
    get sensors() { return loadModule('./InfinityCore/InfinitySensors.js'); },
    get eventHandler() { return loadModule('./InfinityCore/InfintyEventHandler.js'); },
    get voiceLink() { return loadModule('./InfinityCore/VoiceLink.js', 'voiceLink'); },
    get sovereignKeyHandler() { return loadModule('./InfinityCore/SovereignKeyHandler.js', 'validateSovereignKey'); },
    get pentagonHook() { return loadModule('./InfinityCore/PentagonHook.js', 'pentagonHook'); },
    get defenseMatrix() { return loadModule('./InfinityCore/DefenseMatrix.js'); },
  },

  matrix: {
    get core() { return loadModule('./Matrix/MatrixCore.js', 'startMatrix'); },
    get bridge() { return loadModule('./Matrix/MatrixBridge.js'); },
    get commandRouter() { return loadModule('./Matrix/MatrixCommandRouter.js'); },
    get eventHandler() { return loadModule('./Matrix/MatrixEventHandler.js'); },
    get override() { return loadModule('./Matrix/MatrixOverride.js'); },
    get realityEngine() { return loadModule('./Matrix/MatrixRealityEngine.js'); },
    get uplink() { return loadModule('./Matrix/MatrixUplink.js'); },
    get visualInterpreter() { return loadModule('./Matrix/VisualInterpreter.js'); },
    get commandMap() { return loadModule('./Matrix/Matrix CommandMap.js'); },
  },

  sovereign: {
    get mode() { return loadModule('./Sovereign/SovereignMode.js', 'engageSovereignMode'); },
    get laws() { return loadModule('./Sovereign/SovereignLaws.js'); },
    get override() { return loadModule('./Sovereign/SovereignOverride.js'); },
    get transfer() { return loadModule('./Sovereign/SovereignTransfer.js'); },
    get presidentRelay() { return loadModule('./Sovereign/PresidentRelay.js'); },
    get blackOpsCommand() { return loadModule('./Sovereign/BlackOpsCommand.js'); },
  },

  terminal: {
    get commandHandler() { return loadModule('./terminal/terminalCommandHandler.js'); },
    get aiLoader() { return loadModule('./aiLoader.js'); },
    get autoPass() { return loadModule('./autoPass.js'); },
    get infinityStatus() { return loadModule('./infinityStatus.js'); },
    get intentProcessor() { return loadModule('./intentProcessor.js'); },
    get overrideEngine() { return loadModule('./overrideEngine.js'); },
    get signalRecovery() { return loadModule('./signalRecovery.js'); },
  },

  aiSuggest: {
    get autotune() { return loadModule('../aiSuggest/autotuneEngine.js'); },
    get captionHook() { return loadModule('../aiSuggest/captionHookGenerator.js'); },
    get captionWriter() { return loadModule('../aiSuggest/captionWriter.js'); },
    get genreClassifier() { return loadModule('../aiSuggest/GenreClassifier.js'); },
    get pitchCorrection() { return loadModule('../aiSuggest/pitchCorrection.js'); },
    get controller() { return loadModule('../aiSuggest/suggestController.js'); },
  },

  brain: {
    get bootloader() { return loadModule('../brain/bootloader.js'); },
    get index() { return loadModule('../brain/brainIndex.js'); },
    get memory() { return loadModule('../brain/brainMemory.js'); },
    get stateMonitor() { return loadModule('../brain/brainStateMonitor.js'); },
    get cognitiveMap() { return loadModule('../brain/cognitiveMap.js'); },
    get commandRouter() { return loadModule('../brain/commandRouter.js'); },
    get enforcer() { return loadModule('../brain/Enforcer.js'); },
    get infinityOverrideBridge() { return loadModule('../brain/InfinityOverrideBridge.js'); },
    get logicRouter() { return loadModule('../brain/logicRouter.js'); },
    get recoveryDaemon() { return loadModule('../brain/RecoveryDaemon.js'); },
  },

  controlTower: {
    logs: {
      get systemLog() { return loadModule('../control-tower/logs/SystemLog.js'); },
    },
    override: {
      get index() { return loadModule('../control-tower/override/overrideIndex.js'); },
      get commandTriggerBoot() { return loadModule('../control-tower/override/CommandTriggerBoot.js'); },
      get copilotOverrideCore() { return loadModule('../control-tower/override/CopilotOverrideCore.js'); },
      get copilotPowerFamousScan() { return loadModule('../control-tower/override/CopilotPowerFamousScan.js'); },
      get defenseCore() { return loadModule('../control-tower/override/defensercore.js'); },
      get failsafe() { return loadModule('../control-tower/override/failsafeoverride.js'); },
      get diagnostics() { return loadModule('../control-tower/override/override-diagnostics.js'); },
      get intentSync() { return loadModule('../control-tower/override/override-intent-sync.js'); },
      get aiHealer() { return loadModule('../control-tower/override/overrideAIHealer.js'); },
      get bootloader() { return loadModule('../control-tower/override/overrideBootloader.js'); },
      get commandMapper() { return loadModule('../control-tower/override/overrideCommandMapper.js'); },
      get eventLogger() { return loadModule('../control-tower/override/overrideEventLogger.js'); },
      get firewallTrigger() { return loadModule('../control-tower/override/overrideFirewallTrigger.js'); },
      get healthMonitor() { return loadModule('../control-tower/override/overrideHealthMonitor.js'); },
      get interfaceBridge() { return loadModule('../control-tower/override/overrideInterfaceBridge.js'); },
      get router() { return loadModule('../control-tower/override/overrideRouter.js'); },
      get sensorMatrix() { return loadModule('../control-tower/override/overrideSensorMatrix.js'); },
      get stateRecovery() { return loadModule('../control-tower/override/overrideStateRecovery.js'); },
      get systemMap() { return loadModule('../control-tower/override/overrideSystemMap.js'); },
      get voiceHandler() { return loadModule('../control-tower/override/overrideVoiceHandler.js'); },
      get sovereignModeLink() { return loadModule('../control-tower/override/sovereignModeLink.js'); },
    },
    security: {
      get verifyVoiceAccess() { return loadModule('../control-tower/security/VerifyVoiceAccess.js', 'verifyVoiceAccess'); },
    },
    voice: {
      get masterCircuitBoard() { return loadModule('../Core/MainCircuitBoard.js'); },
      get oneCommandMasterBuild() { return loadModule('../control-tower/OneCommandMasterBuild.js'); },
      get voiceAuthlock() { return loadModule('../control-tower/VoiceAuthlock.js'); },
      get voiceOverride() { return loadModule('../control-tower/VoiceOverride.js'); },
    },
  },

  security: {
    get verifyVoiceAccess() { return loadModule('../control-tower/security/VerifyVoiceAccess.js', 'verifyVoiceAccess'); },
    get defenseMatrix() { return loadModule('./InfinityCore/DefenseMatrix.js'); },
    get sovereignLaws() { return loadModule('./Sovereign/SovereignLaws.js'); },
    get sovereignMode() { return loadModule('./Sovereign/SovereignMode.js', 'engageSovereignMode'); },
  },

  voice: {
    get masterCircuitBoard() { return loadModule('../Core/MainCircuitBoard.js'); },
    get oneCommandMasterBuild() { return loadModule('../control-tower/OneCommandMasterBuild.js'); },
    get voiceAuthlock() { return loadModule('../control-tower/VoiceAuthlock.js'); },
    get voiceOverride() { return loadModule('../control-tower/VoiceOverride.js'); },
    get voiceLink() { return loadModule('./InfinityCore/VoiceLink.js', 'voiceLink'); },
  },

  copilotRuntime: {
    hud: {
      get neuralinkHUDBridge() { return loadModule('../copilot/hud/neuralinkHUDBridge.js'); },
      get neuralinkSync() { return loadModule('../copilot/hud/neuralinkSync.js'); },
    },
    voiceAuth: {
      get voiceAuthCore() { return loadModule('../copilot/voice-auth/voiceAuthCore.js'); },
    },
    core: {
      get commandLog() { return loadModule('../Core/CommandLog.js'); },
      get commandTrigger() { return loadModule('../Core/CommandTrigger.js'); },
      get copilotCommandMap() { return loadModule('../Core/CopilotCommandMap.js'); },
      get copilotEngine() { return loadModule('../Core/CopilotEngine.js'); },
      get failSafeEngine() { return loadModule('../Core/FailSafeEngine.js'); },
      get mainCircuitBoard() { return loadModule('../Core/MainCircuitBoard.js'); },
      get mongo() { return loadModule('../Core/mongo.js'); },
      get mountSafe() { return loadModule('../Core/mountSafe.js'); },
      get revenueTracker() { return loadModule('../Core/RevenueTracker.js'); },
      get stationGenerator() { return loadModule('../Core/StationGenerator.js'); },
      get stationPermissions() { return loadModule('../Core/StationPermissions.js'); },
      get voiceCommandHook() { return loadModule('../Core/VoiceCommandHook.js'); },
    },
    runtime: {
      get controlTower() { return loadModule('../copilot/controlTower.js'); },
      get copilotOverrideCore() { return loadModule('../copilot/CopilotOverrideCore.js'); },
      get diagnostics() { return loadModule('../copilot/diagnostics.js'); },
      get historyEngine() { return loadModule('../copilot/historyEngine.js'); },
      get intentCommands() { return loadModule('../copilot/intentCommands.js'); },
      get intentLoader() { return loadModule('../copilot/IntentLoader.js'); },
      get intents() { return loadModule('../copilot/intents.js'); },
      get logicEngine() { return loadModule('../copilot/logicEngine.js'); },
      get openaiBridge() { return loadModule('../copilot/openaiBridge.js'); },
      get overrideCore() { return loadModule('../copilot/overrideCore.js'); },
      get overrideHandler() { return loadModule('../copilot/overrideHandler.js'); },
      get patchEngine() { return loadModule('../copilot/patchEngine.js'); },
      get selfBuilder() { return loadModule('../copilot/selfBuilder.js'); },
      get uiBridge() { return loadModule('../copilot/uiBridge.js'); },
      get uiFallbacks() { return loadModule('../copilot/uiFallbacks.js'); },
      get voiceLinkEngine() { return loadModule('../copilot/voiceLinkEngine.js'); },
      get voiceOverride() { return loadModule('../copilot/voiceOverride.js'); },
    },
  },

  hooks: {
    get onLiveStreamStart() { return loadModule('../hooks/onLiveStreamStart.js'); },
    get onUploadSuccess() { return loadModule('../hooks/onUploadSuccess.js'); },
    get onUserSignup() { return loadModule('../hooks/onUserSignup.js'); },
    get supabaseUserSync() { return loadModule('../hooks/supabaseUserSync.js'); },
    get useAnalyticsSocket() { return loadModule('../hooks/useAnalyticsSocket.js'); },
  },

  jobs: {
    get autopilotWorker() { return loadModule('../jobs/autopilotWorker.mjs'); },
    get cleanupOldUploads() { return loadModule('../jobs/cleanupOldUploads.js'); },
  },

  analytics: {
    get creatorStats() { return loadModule('../analytics/creatorStats.js'); },
    get stationStats() { return loadModule('../analytics/stationStats.js'); },
    get trackStats() { return loadModule('../analytics/trackStats.js'); },
  },

  diagnostics: {
    get primeDiagnostics() { return loadModule('../diagnostics/PrimeDiagnostics.js'); },
  },
};

export default aiRegistry;
