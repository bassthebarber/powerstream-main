// backend/AI/Matrix/MatrixCommandRouter.js

import EventBus from '../../system-core/EventBus.js';

class MatrixCommandRouter {
  static listen() {
    console.log("📡 [MatrixCommandRouter] Ready to route Matrix commands...");

    // Listen for raw text commands meant for Matrix
    EventBus.on('command:matrix', (payload) => {
      console.log(`📨 [MatrixCommandRouter] Routing Matrix command: ${payload.command}`);
      EventBus.emit('matrix:command', payload);
    });

    // Listen for AI system cross-talk
    EventBus.on('system:matrix-instruction', (payload) => {
      console.log(`🔄 [MatrixCommandRouter] Received system instruction for Matrix`);
      EventBus.emit('matrix:command', payload);
    });
  }
}

export default MatrixCommandRouter;
