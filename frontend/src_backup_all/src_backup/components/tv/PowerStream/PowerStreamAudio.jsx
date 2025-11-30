import React from 'react';
import AudioUpload from './AudioUpload';
import './PowerStreamMedia.css';

const PowerStreamAudio = () => {
  return (
    <div className="media-container">
      <img src="/logos/powerstream-logo.png" alt="PowerStream Audio" className="station-logo" />
      <h2>PowerStream Audio</h2>

      <AudioUpload />

      <div className="player-section">
        <h3>🎵 Recently Uploaded Tracks</h3>
        <audio controls src="/media/sample-audio.mp3" style={{ width: '100%' }}>
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default PowerStreamAudio;
