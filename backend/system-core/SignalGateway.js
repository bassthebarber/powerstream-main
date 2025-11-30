// /backend/system-core/SignalGateway.js
const WebSocket = require('ws');
const EventBus = require('./EventBus');

let wss;

module.exports = {
  init(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
      console.log("🔗 [SignalGateway] Frontend connected.");

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          EventBus.emit('frontend:command', data);
        } catch (err) {
          console.error("❌ [SignalGateway] Invalid message from frontend:", err);
        }
      });
    });
  },
  sendToFrontend(command, payload) {
    const message = JSON.stringify({ type: command, payload });
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }
};
