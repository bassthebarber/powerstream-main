// backend/sockets/videoCallSocket.js
// WebRTC signaling for PowerLine voice/video calls
// Note: Actual WebRTC requires TURN/STUN servers configured via WEBRTC_* env vars

import { features } from "../src/config/featureFlags.js";

export default function initVideoCallSocket(io, socket) {
  const userId = socket.user?.id || socket.id;
  
  // Check if WebRTC is configured
  if (!features.webRtcCalls) {
    socket.on('call-user', () => {
      socket.emit('call-error', {
        code: 'SERVICE_NOT_CONFIGURED',
        message: 'Voice/video calls are coming soon!',
      });
    });
    return;
  }

  console.log(`📞 [VideoCall] User ${userId} connected to signaling`);

  // Initiate a call to another user
  socket.on('call-user', ({ userToCall, signalData, from, name, callType = 'audio' }) => {
    console.log(`📞 [VideoCall] ${from} calling ${userToCall} (${callType})`);
    io.to(userToCall).emit('incoming-call', {
      signal: signalData,
      from,
      name,
      callType,
      timestamp: Date.now(),
    });
  });

  // Answer an incoming call
  socket.on('answer-call', ({ to, signal }) => {
    console.log(`📞 [VideoCall] Call answered, signaling to ${to}`);
    io.to(to).emit('call-accepted', {
      signal,
      timestamp: Date.now(),
    });
  });

  // Reject an incoming call
  socket.on('reject-call', ({ to, reason = 'declined' }) => {
    console.log(`📞 [VideoCall] Call rejected by user`);
    io.to(to).emit('call-rejected', {
      reason,
      timestamp: Date.now(),
    });
  });

  // End an active call
  socket.on('end-call', ({ userId: targetUserId }) => {
    console.log(`📞 [VideoCall] Call ended`);
    if (targetUserId) {
      io.to(targetUserId).emit('call-ended', {
        timestamp: Date.now(),
      });
    }
  });

  // ICE candidate exchange
  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', {
      candidate,
      from: userId,
    });
  });

  // Handle disconnect during call
  socket.on('disconnect', () => {
    console.log(`📞 [VideoCall] User ${userId} disconnected`);
    // Notify any active call participants
    socket.broadcast.emit('user-disconnected', {
      userId,
      timestamp: Date.now(),
    });
  });
}

// CommonJS compatibility
export const __esModule = true;

