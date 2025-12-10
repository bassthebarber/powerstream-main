// backend/control-tower/override/overrideIndex.js

import * as defenseCore from './defenseCore.js';
import * as failsafeOverride from './failsafeOverride.js';
import * as commandTriggerBoot from './CommandTriggerBoot.js';
import * as overrideAIHealer from './overrideAIHealer.js';
import * as overrideFirewallTrigger from './overrideFirewallTrigger.js';
import * as overrideInterfaceBridge from './overrideInterfaceBridge.js';
import * as sovereignModelLink from './sovereignModelLink.js';
import * as copilotPowerFamousScan from './copilotPowerFamousScan.js';

const modules = {
  defenseCore,
  failsafe: failsafeOverride,
  boot: commandTriggerBoot,
  healer: overrideAIHealer,
  firewall: overrideFirewallTrigger,
  interface: overrideInterfaceBridge,
  model: sovereignModelLink,
  famousScan: copilotPowerFamousScan,
};

export const triggerModule = async (moduleName, action) => {
  if (modules[moduleName] && typeof modules[moduleName][action] === 'function') {
    return await modules[moduleName][action]();
  } else {
    return `Module/action not found: ${moduleName}/${action}`;
  }
};

export default { triggerModule };
