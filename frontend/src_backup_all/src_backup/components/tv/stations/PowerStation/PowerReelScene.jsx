import React from 'react';

const PowerReelScene = () => (
  <div className="power-reel-scene">
    <h2>🎥 PowerReels Live</h2>
    <p>Vertical video feed for short clips</p>
    <video
      autoPlay
      loop
      muted
      playsInline
      src="/media/sample-reel.mp4"
      style={{ width: "100%", borderRadius: 8 }}
    />
  </div>
);

export default PowerReelScene;


