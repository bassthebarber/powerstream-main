// AICommandRouter.js
import InfinityCoreBridge from './InfinityCoreBridge';
import EventBus from './EventBus';

class AICommandRouter {
  route(command, payload = {}) {
    console.log(`📍 [AICommandRouter] Routing command: ${command}`);

    // Example mapping to different AI modules
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
        console.warn(`⚠️ [AICommandRouter] No handler for command: ${command}`);
    }
  }
}

export default new AICommandRouter();


