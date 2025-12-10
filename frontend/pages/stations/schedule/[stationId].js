// pages/stations/schedule/[stationId].js
import React from 'react';
import { useRouter } from 'next/router';

export default function StationSchedule() {
  const { stationId } = useRouter().query;

  return (
    <div className="station-schedule">
      <h1>Schedule for Station {stationId}</h1>
      <p>Plan and manage programming.</p>
      {/* TODO: Fetch and update schedule */}
    </div>
  );
}
