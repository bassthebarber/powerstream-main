import React from 'react';
import CivicUpload from './CivicUpload';
import MessageBoard from './MessageBoard';
import './CivicConnectStation.css';

const CivicConnectStation = () => {
  return (
    <div className="civic-station">
      <img
        src="/logos/civicconnectlogo.png"
        alt="Civic Connect"
        className="station-logo"
      />
      <h2>Civic Connect – Community Broadcast</h2>

      <div className="civic-section">
        <CivicUpload />
        <MessageBoard />
      </div>
    </div>
  );
};

export default CivicConnectStation;
