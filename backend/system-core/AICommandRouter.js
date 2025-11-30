// /backend/system-core/AICommandRouter.js
const EventBus = require('./EventBus');
const InfinityCoreBridge = require('./InfinityCoreBridge');

class AICommandRouter {
  route(command, payload = {}) {
    console.log(`📍 [AICommandRouter] Routing backend command: ${command}`);

    switch (command) {
      case 'BUILD_NETFLIX':
      case 'BUILD_SPOTIFY':
      case 'BUILD_TIKTOK':
      case 'BUILD_INSTAGRAM':
        InfinityCoreBridge.execute(command, payload);
        break;

      case 'ACTIVATE_GUARD_MODE':
        EventBus.emit('guard:activate', payload);
        break;

      case 'OVERRIDE_AI':
        EventBus.emit('override:engage', payload);
        break;

      default:
        console.warn(`⚠️ [AICommandRouter] No backend handler for: ${command}`);
    }
  }
}

module.exports = new AICommandRouter();
