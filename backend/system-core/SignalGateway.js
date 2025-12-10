// backend/system-core/SignalGateway.js

import { WebSocketServer, WebSocket } from 'ws';
import EventBus from './EventBus.js';

let wss;

const SignalGateway = {
  init(server) {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
      console.log("🔗 [SignalGateway] Frontend connected.");

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
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

export default SignalGateway;
