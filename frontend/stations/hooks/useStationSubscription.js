// frontend/src/hooks/stations/useStationSubscription.js
import { useState, useEffect } from 'react';

export default function useStationSubscription(stationId, userId) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!stationId || !userId) return;

    fetch(`/api/stations/${stationId}/subscription/${userId}`)
      .then(res => res.json())
      .then(data => {
        setIsSubscribed(data.subscribed);
      })
      .catch(err => console.error('Subscription check error:', err));
  }, [stationId, userId]);

  const toggleSubscription = () => {
    fetch(`/api/stations/${stationId}/subscription/${userId}`, {
      method: isSubscribed ? 'DELETE' : 'POST'
    })
      .then(res => res.json())
      .then(data => {
        setIsSubscribed(data.subscribed);
      })
      .catch(err => console.error('Subscription toggle error:', err));
  };

  return { isSubscribed, toggleSubscription };
}
