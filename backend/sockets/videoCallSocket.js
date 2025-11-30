// backend/sockets/videoCallSocket.js

module.exports = (io, socket) => {
  socket.on('call-user', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('incoming-call', { signal: signalData, from, name });
  });

  socket.on('answer-call', ({ to, signal }) => {
    io.to(to).emit('call-accepted', signal);
  });

  socket.on('end-call', (userId) => {
    io.to(userId).emit('call-ended');
  });
};
