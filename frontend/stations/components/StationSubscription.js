// frontend/src/components/StationSubscription.js
import React from 'react';

export default function StationSubscription({ stationId }) {
  const handleSubscribe = () => {
    fetch(`/api/stations/${stationId}/subscribe`, { method: 'POST' })
      .then(() => alert('Subscribed successfully!'))
      .catch(err => console.error('Subscription error:', err));
  };

  return (
    <div className="station-subscription">
      <button onClick={handleSubscribe}>Subscribe</button>
    </div>
  );
}
