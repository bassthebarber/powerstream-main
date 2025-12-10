// frontend/src/hooks/stations/useStationAnalytics.js
import { useState, useEffect } from 'react';

export default function useStationAnalytics(stationId) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stationId) return;
    setLoading(true);

    fetch(`/api/stations/${stationId}/analytics`)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading analytics:', err);
        setLoading(false);
      });
  }, [stationId]);

  return { analytics, loading };
}
