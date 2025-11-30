import React, { useRef, useEffect } from 'react';

const StudioVideoPanel = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Example: Activate webcam
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error('Video stream error:', err));
  }, []);

  return (
    <div className="studioPanel video-panel">
      <h2>🎥 Live Video Feed</h2>
      <video ref={videoRef} autoPlay playsInline muted />
    </div>
  );
};

export default StudioVideoPanel;
