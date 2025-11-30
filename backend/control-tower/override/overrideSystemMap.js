// /backend/controlTower/override/overrideSystemMap.js

const systemMap = {
  'boot': 'commandTrigger.boot',
  'copilot-core': 'copilotOverrideCore',
  'scan': 'copilotPowerFamousScan',
  'defense': 'defenseCore',
  'failsafe': 'failsafeOverride',
  'sovereign': 'sovereignModelLink',
  'healer': 'overrideAIHealer',
  'firewall': 'overrideFirewallTrigger',
  'sensor': 'overrideSensorMatrix',
  'voice': 'overrideVoiceHandler',
  'bridge': 'overrideInterfaceBridge',
};

module.exports = systemMap;
