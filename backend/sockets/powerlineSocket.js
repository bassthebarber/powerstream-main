// backend/sockets/powerlineSocket.js
// PowerLine Socket.IO handler for real-time messaging

export default function setupPowerLineSocket(io) {
  const powerlineNsp = io.of('/powerline');

  powerlineNsp.on('connection', (socket) => {
    console.log('[PowerLine Socket] Client connected:', socket.id);

    // Join a thread room
    socket.on('joinThread', (threadId) => {
      if (threadId) {
        socket.join(`thread:${threadId}`);
        console.log(`[PowerLine Socket] ${socket.id} joined thread:${threadId}`);
      }
    });

    // Leave a thread room
    socket.on('leaveThread', (threadId) => {
      if (threadId) {
        socket.leave(`thread:${threadId}`);
        console.log(`[PowerLine Socket] ${socket.id} left thread:${threadId}`);
      }
    });

    // Typing indicator
    socket.on('typing', (threadId) => {
      if (threadId) {
        socket.to(`thread:${threadId}`).emit('typing', {
          threadId,
          userId: socket.userId
        });
      }
    });

    socket.on('stopTyping', (threadId) => {
      if (threadId) {
        socket.to(`thread:${threadId}`).emit('stopTyping', {
          threadId,
          userId: socket.userId
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('[PowerLine Socket] Client disconnected:', socket.id);
    });
  });

  // Also handle default namespace for backwards compatibility
  io.on('connection', (socket) => {
    // Join a thread room
    socket.on('joinThread', (threadId) => {
      if (threadId) {
        socket.join(`thread:${threadId}`);
        console.log(`[Socket] ${socket.id} joined thread:${threadId}`);
      }
    });

    // Leave a thread room
    socket.on('leaveThread', (threadId) => {
      if (threadId) {
        socket.leave(`thread:${threadId}`);
        console.log(`[Socket] ${socket.id} left thread:${threadId}`);
      }
    });
  });

  return powerlineNsp;
}

// Helper to emit message:new event
export function emitNewMessage(io, threadId, message) {
  // Emit to both namespace and default
  io.of('/powerline').to(`thread:${threadId}`).emit('message:new', {
    ...message,
    threadId
  });
  io.to(`thread:${threadId}`).emit('message:new', {
    ...message,
    threadId
  });
  // Also emit thread:updated for sidebar previews
  io.emit('thread:updated', { threadId });
}

// Helper to emit thread:new event
export function emitNewThread(io, thread) {
  io.of('/powerline').emit('thread:new', thread);
  io.emit('thread:new', thread);
}
