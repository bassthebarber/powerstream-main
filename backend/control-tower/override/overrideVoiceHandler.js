// /backend/controlTower/override/overrideVoiceHandler.js

const handleVoiceCommand = (transcript) => {
  console.log(`🎙️ Voice Handler: Received transcript → "${transcript}"`);

  const knownCommands = {
    'start override': 'commandTrigger.boot',
    'activate firewall': 'overrideFirewallTrigger',
    'link sovereign': 'sovereignModelLink',
    'engage defense': 'defenseCore',
    'safe mode': 'failsafeOverride',
  };

  const mapped = knownCommands[transcript.toLowerCase()] || null;

  if (mapped) {
    console.log(`✅ Mapped to override module: ${mapped}`);
    return { status: 'recognized', module: mapped };
  } else {
    console.log('❌ Voice command not recognized');
    return { status: 'unrecognized' };
  }
};

module.exports = {
  handle: handleVoiceCommand,
};
