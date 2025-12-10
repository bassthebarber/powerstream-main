// frontend/src/pages/stations/StationDashboard.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function StationDashboard() {
  const { stationId } = useParams();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch(`/api/stations/${stationId}/analytics`)
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Analytics load error:', err));
  }, [stationId]);

  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <div className="station-dashboard">
      <h2>Station Dashboard</h2>
      <p><strong>Viewers:</strong> {analytics.viewers}</p>
      <p><strong>Subscribers:</strong> {analytics.subscribers}</p>
      <p><strong>Total Watch Time:</strong> {analytics.watchTime} hrs</p>
      <p><strong>Revenue:</strong> ${analytics.revenue}</p>
    </div>
  );
}
