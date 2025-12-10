// backend/sockets/AIResponder.js

export default function AIResponder(io, socket) {
  console.log('🤖 AI Responder socket connected:', socket.id);

  socket.on('ai:ask', async (data) => {
    console.log('AI request:', data);

    // Simulated response
    const answer = `You asked: ${data.question || 'unknown'}`;
    socket.emit('ai:response', { answer });
  });

  socket.on('disconnect', () => {
    console.log('🤖 AI Responder socket disconnected:', socket.id);
  });
}
