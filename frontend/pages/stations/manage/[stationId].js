// pages/stations/manage/[stationId].js
import React from 'react';
import { useRouter } from 'next/router';

export default function ManageStation() {
  const { stationId } = useRouter().query;

  return (
    <div className="manage-station">
      <h1>Manage Station {stationId}</h1>
      <p>Adjust settings, schedule, and analytics.</p>
      {/* TODO: Fetch station data from API */}
    </div>
  );
}
