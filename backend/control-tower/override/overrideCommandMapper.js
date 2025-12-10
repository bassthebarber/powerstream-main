// backend/control-tower/override/overrideCommandMapper.js

const commandMap = {
  boot: () => 'System Boot Triggered',
  heal: () => 'AI Recovery Initiated',
  reset: () => 'Override Core Resetting',
  ping: () => 'Override Ping Acknowledged',
};

export const runOverrideCommand = (cmd) => {
  return commandMap[cmd] ? commandMap[cmd]() : 'Unknown Command';
};

export default { runOverrideCommand };
