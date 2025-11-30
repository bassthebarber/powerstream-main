// backend/sockets/adminControlSocket.js

export default function adminControlSocket(io, socket) {
  console.log('🛠️ Admin control socket connected:', socket.id);

  // Listen for admin override trigger
  socket.on('admin:override', (data) => {
    console.log('⚠️ Admin override activated:', data);
    io.emit('system:overrideTriggered', {
      message: 'System override activated by admin.',
      data,
    });
  });

  // Live deployment command
  socket.on('admin:deploy', (payload) => {
    console.log('🚀 Admin requested deployment:', payload);
    // Simulate a response
    socket.emit('system:deploymentConfirmed', {
      status: 'success',
      timestamp: new Date(),
    });
  });

  // System status check
  socket.on('admin:checkSystem', () => {
    console.log('🧠 System status requested');
    socket.emit('system:statusResponse', {
      brain: 'online',
      override: 'active',
      ai: 'synced',
      timestamp: new Date(),
    });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log('🛑 Admin socket disconnected:', socket.id);
  });
}
