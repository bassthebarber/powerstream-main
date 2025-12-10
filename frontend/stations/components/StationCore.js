// frontend/src/components/StationCore.js
import React, { useEffect, useState } from 'react';
import StationHeader from './StationHeader';
import StationSideboard from './StationSideboard';
import StationPlayer from './StationPlayer';
import StationSchedule from './StationSchedule';
import StationSubscription from './StationSubscription';
import StationAnalytics from './StationAnalytics';

export default function StationCore({ stationId }) {
  const [stationData, setStationData] = useState(null);

  useEffect(() => {
    fetch(`/api/stations/${stationId}`)
      .then(res => res.json())
      .then(data => setStationData(data))
      .catch(err => console.error('StationCore load error:', err));
  }, [stationId]);

  if (!stationData) return <div>Loading station...</div>;

  return (
    <div className="station-core">
      <StationHeader title={stationData.name} />
      <div className="station-layout">
        <StationSideboard stationId={stationId} />
        <div className="station-main">
          <StationPlayer streamUrl={stationData.streamUrl} />
          <StationSchedule schedule={stationData.schedule} />
          <StationSubscription stationId={stationId} />
          <StationAnalytics analytics={stationData.analytics} />
        </div>
      </div>
    </div>
  );
}
