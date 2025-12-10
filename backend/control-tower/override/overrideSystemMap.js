// /backend/control-tower/override/overrideSystemMap.js

export const systemMap = {
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

export default systemMap;
