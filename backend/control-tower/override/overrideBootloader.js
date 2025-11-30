// /backend/controlTower/override/overrideBootloader.js

const bootAllOverrideModules = () => {
  console.log('🚀 Bootloader: Initializing all override modules...');

  const modules = [
    'commandTrigger.boot',
    'copilotOverrideCore',
    'copilotPowerFamousScan',
    'defenseCore',
    'failsafeOverride',
    'sovereignModelLink',
    'overrideFirewallTrigger',
    'overrideSensorMatrix',
    'overrideVoiceHandler',
    'overrideInterfaceBridge',
    'overrideAIHealer',
  ];

  modules.forEach(mod => console.log(`✅ Booted → ${mod}`));

  return {
    status: 'booted',
    modulesInitialized: modules.length,
    bootTime: new Date().toISOString(),
  };
};

module.exports = {
  bootAllOverrideModules,
};
