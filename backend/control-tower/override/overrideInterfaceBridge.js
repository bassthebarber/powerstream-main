// /backend/control-tower/override/overrideInterfaceBridge.js

export const bridgeInterface = (frontendSignal) => {
  console.log('🌉 Override Interface Bridge: Syncing frontend and backend signals');

  const actions = {
    'UI_BOOT_TRIGGER': 'commandTrigger.boot',
    'UI_LOCKDOWN': 'failsafeOverride',
    'UI_SCAN_NOW': 'copilotPowerFamousScan',
  };

  const linkedModule = actions[frontendSignal] || null;

  if (linkedModule) {
    console.log(`🔗 Linked frontend signal to: ${linkedModule}`);
    return { linkedModule, status: 'linked' };
  } else {
    console.log('⚠️ Unrecognized frontend signal');
    return { status: 'unknown' };
  }
};

export default { bridgeInterface };
