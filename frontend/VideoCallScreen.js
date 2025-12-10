import React, { useRef, useEffect } from 'react';

const VideoCallScreen = ({ localStream, remoteStream }) => {
  const localRef = useRef(null);
  const remoteRef = useRef(null);

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  return (
    <div className="video-call-screen">
      <video ref={localRef} autoPlay muted />
      <video ref={remoteRef} autoPlay />
    </div>
  );
};

export default VideoCallScreen;
