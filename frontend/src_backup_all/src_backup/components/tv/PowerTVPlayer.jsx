import React from 'react';

export default function PowerTVPlayer({ streamUrl }) {
  return (
    <div className="power-tv-player">
      <h2>📺 PowerTV Live Stream</h2>
      <video controls autoPlay width="100%">
        <source src={streamUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
