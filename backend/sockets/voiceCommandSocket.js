// backend/sockets/voiceCommandSocket.js

const voiceService = require('../services/voiceService');
const logUplink = require('../logs/logUplink');

module.exports = (io, socket) => {
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
