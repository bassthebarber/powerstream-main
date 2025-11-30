// /backend/AI/InfinityCore/InfinityCommandRouter.js
const EventBus = require('../../system-core/EventBus');
const DefenseMatrix = require('./DefenseMatrix');
const PentagonHook = require('./PentagonHook');
const InfinityOverride = require('./InfinityOverride');
const InfinityMemory = require('./InfinityMemory');
const SovereignKeyHandler = require('./SovereignKeyHandler');
const VoiceLink = require('./VoiceLink');

class InfinityCommandRouter {
  constructor() {
    this.commands = {
      "activate-defense": () => DefenseMatrix.activate({ level: 'max' }),
      "pentagon-link": () => PentagonHook.establishLink(),
      "override-mode": () => InfinityOverride.enable(),
      "recall-memory": (query) => InfinityMemory.recall(query),
      "store-memory": (data) => InfinityMemory.store(data),
      "verify-sovereign": (voiceData) => SovereignKeyHandler.verify(voiceData),
      "process-voice": (cmd) => VoiceLink.processCommand(cmd)
    };
  }

  route(command, payload) {
    if (this.commands[command]) {
      console.log(`🚦 [InfinityCommandRouter] Routing command: ${command}`);
      this.commands[command](payload);
    } else {
      console.warn(`⚠️ [InfinityCommandRouter] Unknown command: ${command}`);
    }
  }

  listen() {
    console.log("📡 [InfinityCommandRouter] Listening for Infinity Core commands...");
    EventBus.on('infinity:command', ({ command, payload }) => {
      this.route(command, payload);
    });
  }
}

module.exports = new InfinityCommandRouter();
