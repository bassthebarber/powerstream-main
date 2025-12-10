import React from 'react';
import NoLimitUpload from './NoLimitUpload';
import NoLimitStream from './NoLimitStream';
import NoLimitTVGuide from './NoLimitTVGuide';
import './NoLimitStation.css';

const NoLimitStation = () => {
  return (
    <div className="nolimit-station">
      <img
        src="/logos/nolimit-easthouston-logo.png"
        alt="No Limit East Houston"
        className="station-logo"
      />
      <h2>No Limit East Houston TV</h2>

      <div className="station-section">
        <NoLimitUpload />
        <NoLimitStream />
        <NoLimitTVGuide />
      </div>
    </div>
  );
};

export default NoLimitStation;
