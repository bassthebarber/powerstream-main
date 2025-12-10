export const setupCallSocket = (socket, { onIncomingCall, onCallAccepted, onCallEnded }) => {
  socket.on('incoming-call', onIncomingCall);
  socket.on('call-accepted', onCallAccepted);
  socket.on('call-ended', onCallEnded);
};
