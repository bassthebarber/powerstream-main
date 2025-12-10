// backend/control-tower/override/CommandTriggerBoot.js

import * as defenseCore from './defenseCore.js';
import * as failsafeOverride from './failsafeOverride.js';
import * as overrideAIHealer from './overrideAIHealer.js';
import * as overrideFirewallTrigger from './overrideFirewallTrigger.js';
import * as overrideInterfaceBridge from './overrideInterfaceBridge.js';
import * as sovereignModelLink from './sovereignModelLink.js';
import * as copilotPowerFamousScan from './copilotPowerFamousScan.js';

const modules = {
  defenseCore,
  failsafe: failsafeOverride,
  healer: overrideAIHealer,
  firewall: overrideFirewallTrigger,
  interface: overrideInterfaceBridge,
  model: sovereignModelLink,
  famousScan: copilotPowerFamousScan,
};

export const start = () => {
  console.log('🚀 [CommandTriggerBoot] Starting override system...');
  return {
    status: 'booted',
    timestamp: new Date().toISOString(),
    modules: Object.keys(modules),
  };
};

export const triggerModule = async (moduleName, action) => {
  if (modules[moduleName] && typeof modules[moduleName][action] === 'function') {
    return await modules[moduleName][action]();
  } else {
    return `Module/action not found: ${moduleName}/${action}`;
  }
};

export default { start, triggerModule };
