// MainCircuitBoard.js
import EventBus from './EventBus';
import AICommandRouter from './AICommandRouter';
import SystemStatusMonitor from './SystemStatusMonitor';
import InfinityCoreBridge from './InfinityCoreBridge';
import VoiceControlHub from './VoiceControlHub';

class MainCircuitBoard {
  constructor() {
    this.modules = {
      AHA: true,
      Ahab: true,
      InfinityCore: true,
      Matrix: true,
      Copilot: true,
      Pentagon: true,
      GuardMode: true,
      AdminPanel: true
    };

    this.isOnline = false;
  }

  initialize() {
    console.log("🧠 [MainCircuitBoard] Initializing PowerStream unified AI system...");

    // Start status monitor
    SystemStatusMonitor.start(this.modules);

    // Connect to InfinityCore
    InfinityCoreBridge.connect();

    // Start voice AI (always listening)
    VoiceControlHub.start((intent) => {
      console.log(`🎯 [MainCircuitBoard] Received AI intent: ${intent}`);
      AICommandRouter.route(intent, { source: 'voice' });
    });

    // Listen for backend signals
    EventBus.on('backend:signal', (signal) => {
      console.log(`📡 [MainCircuitBoard] Received backend signal: ${signal.type}`);
      AICommandRouter.route(signal.type, signal.payload);
    });

    this.isOnline = true;
    console.log("✅ [MainCircuitBoard] All systems online.");
  }

  sendCommand(command, payload = {}) {
    console.log(`🚀 [MainCircuitBoard] Sending command: ${command}`);
    AICommandRouter.route(command, payload);
  }
}

export default new MainCircuitBoard();


