// frontend/src/components/StationAnalytics.js
import React from 'react';

export default function StationAnalytics({ analytics }) {
  if (!analytics) return null;

  return (
    <div className="station-analytics">
      <p>Viewers: {analytics.viewers}</p>
      <p>Subscribers: {analytics.subscribers}</p>
      <p>Total Watch Time: {analytics.watchTime} hours</p>
    </div>
  );
}
