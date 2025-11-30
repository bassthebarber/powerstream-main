// overrideIndex.js

const modules = {
  defenseCore: require('./defenseCore'),
  failsafe: require('./failsafeOverride'),
  boot: require('./commandTrigger.boot'),
  healer: require('./overrideAIHealer'),
  firewall: require('./overrideFirewallTrigger'),
  interface: require('./overrideInterfaceBridge'),
  model: require('./sovereignModelLink'),
  famousScan: require('./copilotPowerFamousScan'),
};

const triggerModule = async (module, action) => {
  if (modules[module] && typeof modules[module][action] === 'function') {
    return await modules[module][action]();
  } else {
    return `Module/action not found: ${module}/${action}`;
  }
};

module.exports = { triggerModule };
