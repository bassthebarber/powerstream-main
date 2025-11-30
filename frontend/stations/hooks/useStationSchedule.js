// frontend/src/hooks/stations/useStationSchedule.js
import { useState, useEffect } from 'react';

export default function useStationSchedule(stationId) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stationId) return;
    setLoading(true);

    fetch(`/api/stations/${stationId}/schedule`)
      .then(res => res.json())
      .then(data => {
        setSchedule(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading schedule:', err);
        setLoading(false);
      });
  }, [stationId]);

  const addScheduleItem = (item) => {
    setSchedule(prev => [...prev, item]);
  };

  return { schedule, addScheduleItem, loading };
}
