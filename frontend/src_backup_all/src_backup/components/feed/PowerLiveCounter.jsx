// src/components/feed/PowerLiveCounter.jsx
import { useEffect, useState } from 'react';
import { getLiveViews } from '../../services/feedApi';

export default function PowerLiveCounter({ postId }) {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const fetchViews = async () => {
      const res = await getLiveViews(postId);
      setViews(res?.views || 0);
    };

    fetchViews();
    const interval = setInterval(fetchViews, 5000); // live poll every 5 sec
    return () => clearInterval(interval);
  }, [postId]);

  return (
    <div className="live-counter">
      👁️ {views} view{views !== 1 ? 's' : ''}
    </div>
  );
}


