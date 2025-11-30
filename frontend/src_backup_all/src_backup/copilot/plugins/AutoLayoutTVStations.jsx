// frontend/src/copilot/plugins/AutoLayoutTVStations.jsx
import React from 'react';
import branding from '../../configs/branding';

const AutoLayoutTVStations = ({ stations }) => {
  return (
    <div className="auto-layout-stations">
      {stations.map((station, index) => (
        <div key={index} className="station-block">
          <img src={branding.tvStations[station]?.logo} alt={station} />
          <h4>{branding.tvStations[station]?.name}</h4>
        </div>
      ))}
    </div>
  );
};

export default AutoLayoutTVStations;


