// TVSocket.js

export const registerTVSocket = (io) => {
  const tvNamespace = io.of('/tv');

  tvNamespace.on('connection', (socket) => {
    console.log('📺 TV user connected:', socket.id);

    socket.on('send-reaction', (data) => {
      tvNamespace.emit('broadcast-reaction', data); // realtime hearts, likes, etc.
    });

    socket.on('sync-play', (timestamp) => {
      tvNamespace.emit('sync-client', timestamp);
    });

    socket.on('disconnect', () => {
      console.log('❌ TV user disconnected:', socket.id);
    });
  });
};
