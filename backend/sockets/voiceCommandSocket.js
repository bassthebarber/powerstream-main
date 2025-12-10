// backend/sockets/voiceCommandSocket.js

import voiceService from '../services/voiceService.js';
import logUplink from '../logs/logUplink.js';

const voiceCommandSocket = (io, socket) => {
  socket.on('voice-command', async (data) => {
    const { transcript, userId } = data;

    logUplink('VoiceCommandSocket', 'info', `Voice trigger: "${transcript}"`, { userId });

    try {
      const result = await voiceService.handleVoiceCommand(transcript, {
        userId,
        source: 'socket-voice',
      });

      socket.emit('voice-command-result', result);
    } catch (err) {
      socket.emit('voice-command-result', {
        success: false,
        error: err.message,
      });
    }
  });
};

export default voiceCommandSocket;
