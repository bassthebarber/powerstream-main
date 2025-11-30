import React from 'react';

const NoLimitStream = () => {
  return (
    <div className="stream-section">
      <h3>🎥 Live Broadcast</h3>
      <iframe
        width="100%"
        height="400"
        src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="No Limit Live"
      ></iframe>
    </div>
  );
};

export default NoLimitStream;
