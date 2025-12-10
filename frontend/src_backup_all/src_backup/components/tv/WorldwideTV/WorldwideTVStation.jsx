import React from 'react';
import './WorldwideTVStation.css';

const WorldwideTVStation = () => {
  return (
    <div className="worldwide-station">
      <img
        src="/logos/worldwidetv.png"
        alt="Worldwide TV"
        className="station-logo"
      />
      <h2>🌍 Worldwide TV</h2>
      <p>Broadcasting across the globe – music, culture, and talent with no borders.</p>

      <div className="video-section">
        <h3>🎥 Featured Stream</h3>
        <iframe
          width="100%"
          height="400"
          src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID"
          title="Worldwide TV Live"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>

      <div className="upload-section">
        <h3>Upload a Global Submission</h3>
        <input type="file" />
        <button>Upload</button>
      </div>
    </div>
  );
};

export default WorldwideTVStation;
