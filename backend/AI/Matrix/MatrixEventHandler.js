// /backend/AI/Matrix/MatrixEventHandler.js
const EventBus = require('../../system-core/EventBus');
const MatrixCore = require('./MatrixCore');
const MatrixCommandMap = require('./MatrixCommandMap');
const MatrixOverride = require('./MatrixOverride');
const VisualInterpreter = require('./VisualInterpreter');

class MatrixEventHandler {
    static init() {
        console.log("🛰️ [MatrixEventHandler] Listening for Matrix AI events...");

        // When a Matrix command comes in
        EventBus.on('matrix:command', async (payload) => {
            console.log(`🧠 [MatrixEventHandler] Command received: ${payload.command}`);
            const mapped = MatrixCommandMap.mapCommand(payload.command);
            await MatrixCore.process(mapped, payload.data || {});
        });

        // When a Matrix override is triggered
        EventBus.on('matrix:override', async (payload) => {
            console.warn(`⚠️ [MatrixEventHandler] Override triggered: ${payload.reason}`);
            await MatrixOverride.execute(payload.reason);
        });

        // When visual data is detected
        EventBus.on('matrix:vision-detected', async (imageData) => {
            console.log(`👁️ [MatrixEventHandler] Visual data received`);
            const context = await VisualInterpreter.analyze(imageData);
            EventBus.emit('matrix:context-ready', context);
        });
    }
}

module.exports = MatrixEventHandler;
