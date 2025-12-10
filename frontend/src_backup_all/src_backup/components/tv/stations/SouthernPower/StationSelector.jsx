import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StationSelector.css';

const StationSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="station-selector-container">
      <img
        src="/logos/southernpowernetworklogo.png"
        alt="Southern Power Network"
        className="southern-logo"
      />
      <h1>Southern Power Network</h1>
      <p>Select a station to begin streaming, uploading, or voting.</p>

      <div className="station-grid">
        <button onClick={() => navigate('/nolimit')}>No Limit East Houston</button>
        <button onClick={() => navigate('/tgt')}>Texas Got Talent</button>
        <button onClick={() => navigate('/civic')}>Civic Connect</button>
        <button onClick={() => navigate('/worldwide')}>Worldwide TV</button>
      </div>

      <div className="media-options">
        <button onClick={() => navigate('/powerscreen/audio')}>🎵 PowerStream Audio</button>
        <button onClick={() => navigate('/powerscreen/video')}>🎥 PowerStream Video</button>
      </div>
    </div>
  );
};

export default StationSelector;
