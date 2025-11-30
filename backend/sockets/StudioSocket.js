// StudioSocket.js

export const registerStudioSocket = (io) => {
  const studioNamespace = io.of('/studio');

  studioNamespace.on('connection', (socket) => {
    console.log('🎚️ Studio user connected:', socket.id);

    socket.on('collab-update', (data) => {
      studioNamespace.emit('collab-sync', data); // sync across users
    });

    socket.on('voice-track', (audioBlob) => {
      // Forward audio stream or buffer to others
      studioNamespace.emit('voice-track-receive', audioBlob);
    });

    socket.on('disconnect', () => {
      console.log('❌ Studio user disconnected:', socket.id);
    });
  });
};
