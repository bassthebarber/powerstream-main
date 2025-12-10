// frontend/src/components/StationSideboard.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function StationSideboard({ stationId }) {
  return (
    <aside className="station-sideboard">
      <ul>
        <li><Link to={`/stations/${stationId}/chat`}>Live Chat</Link></li>
        <li><Link to={`/stations/${stationId}/schedule`}>Schedule</Link></li>
        <li><Link to={`/stations/${stationId}/analytics`}>Analytics</Link></li>
      </ul>
    </aside>
  );
}
