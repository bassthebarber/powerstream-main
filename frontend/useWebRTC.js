import { useEffect, useRef } from 'react';

const useWebRTC = (socket, onStream) => {
  const peerRef = useRef(null);

  const createPeer = (stream) => {
    const peer = new RTCPeerConnection();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    return peer;
  };

  useEffect(() => {
    socket.on('offer', async ({ offer, from }) => {
      const peer = createPeer(await navigator.mediaDevices.getUserMedia({ video: true, audio: true }));
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('answer', { answer, to: from });
      peer.ontrack = e => onStream(e.streams[0]);
      peerRef.current = peer;
    });

    socket.on('answer', async ({ answer }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(answer);
      }
    });

    socket.on('ice-candidate', ({ candidate }) => {
      if (peerRef.current && candidate) {
        peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  }, [socket, onStream]);

  return peerRef;
};

export default useWebRTC;
