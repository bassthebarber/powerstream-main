export default function setupSocketRoutes(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });

    socket.on('chatMessage', (msg) => {
      io.emit('chatMessage', msg);
    });

    socket.on('vote', (data) => {
      io.emit('voteUpdate', data);
    });
  });
}
