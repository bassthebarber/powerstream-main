// NoLimitSocket.js

export const registerNoLimitSocket = (io) => {
  const noLimitNamespace = io.of('/nolimit');

  noLimitNamespace.on('connection', (socket) => {
    console.log('🎤 NoLimit user connected:', socket.id);

    socket.on('sendMessage', (data) => {
      console.log('💬 NoLimit message:', data);
      noLimitNamespace.emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ NoLimit user disconnected:', socket.id);
    });
  });
};
