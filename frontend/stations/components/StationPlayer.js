// frontend/src/components/StationPlayer.js
import React from 'react';

export default function StationPlayer({ streamUrl }) {
  if (!streamUrl) return <div>No active stream</div>;

  return (
    <div className="station-player">
      <video src={streamUrl} controls autoPlay style={{ width: '100%' }} />
    </div>
  );
}
