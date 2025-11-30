// /backend/AI/Matrix/MatrixBridge.js
const EventBus = require('../../system-core/EventBus');

class MatrixBridge {
    static connect() {
        console.log("🔗 [MatrixBridge] Connecting Matrix ↔ Infinity Core...");

        // When Matrix detects reality updates, send to Infinity
        EventBus.on('matrix:context-ready', (context) => {
            console.log(`🛠️ [MatrixBridge] Sending Matrix context to Infinity`);
            EventBus.emit('infinity:context-update', context);
        });

        // When Infinity sends override, push to Matrix
        EventBus.on('infinity:matrix-override', (payload) => {
            console.warn(`⚠️ [MatrixBridge] Infinity override for Matrix triggered`);
            EventBus.emit('matrix:override', payload);
        });
    }
}

module.exports = MatrixBridge;
