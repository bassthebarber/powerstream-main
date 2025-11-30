// frontend/src/hooks/stations/useStationData.js
import { useState, useEffect } from 'react';

export default function useStationData(stationId) {
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stationId) return;
    setLoading(true);

    fetch(`/api/stations/${stationId}`)
      .then(res => res.json())
      .then(data => {
        setStation(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading station:', err);
        setLoading(false);
      });
  }, [stationId]);

  return { station, setStation, loading };
}
