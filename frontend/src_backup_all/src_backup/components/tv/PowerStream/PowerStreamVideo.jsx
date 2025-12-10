import React from 'react';
import VideoUpload from './VideoUpload';
import './PowerStreamMedia.css';

const PowerStreamVideo = () => {
  return (
    <div className="media-container">
      <img src="/logos/powerstream-logo.png" alt="PowerStream Video" className="station-logo" />
      <h2>PowerStream Video</h2>

      <VideoUpload />

      <div className="player-section">
        <h3>📺 Featured Artist Video</h3>
        <video controls width="100%">
          <source src="/media/sample-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default PowerStreamVideo;
