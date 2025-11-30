import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SouthernPowerNetwork.css';

const SouthernPowerNetwork = () => {
  const navigate = useNavigate();

  return (
    <div className="sps-container">
      <img
        src="/logos/southernpowernetworklogo.png"
        alt="Southern Power Network"
        className="sps-logo"
      />
      <h1>Southern Power Network</h1>
      <p>Select a station below</p>

      <div className="sps-stations">
        <button onClick={() => navigate('/nolimit')}>No Limit East Houston</button>
        <button onClick={() => navigate('/tgt')}>Texas Got Talent</button>
        <button onClick={() => navigate('/civic')}>Civic Connect</button>
        <button onClick={() => navigate('/worldwide')}>Worldwide TV</button>
      </div>

      <div className="sps-submenu">
        <button onClick={() => navigate('/powerscreen/audio')}>🎵 PowerScreen Audio</button>
        <button onClick={() => navigate('/powerscreen/video')}>📺 PowerScreen Video</button>
      </div>
    </div>
  );
};

export default SouthernPowerNetwork;
