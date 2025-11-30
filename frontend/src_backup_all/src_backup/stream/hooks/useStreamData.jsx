// frontend/hooks/UseStreamData.js
import { useState, useEffect } from 'react';

export default function useStreamData(streamId) {
  const [streamData, setStreamData] = useState({
    title: '',
    viewers: 0,
    likes: 0,
    isLive: false,
  });

  useEffect(() => {
    if (!streamId) return;

    const fetchStreamData = async () => {
      try {
        const res = await fetch(`/api/streams/${streamId}`);
        const data = await res.json();
        setStreamData(data);
      } catch (err) {
        console.error('Error fetching stream data:', err);
      }
    };

    fetchStreamData();

    // Optional: refresh every 5 seconds
    const interval = setInterval(fetchStreamData, 5000);
    return () => clearInterval(interval);
  }, [streamId]);

  return streamData;
}


