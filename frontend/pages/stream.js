// pages/stream.js
import React, { useEffect, useState } from 'react';
import StreamPlayer from '../components/StreamPlayer';

const StreamPage = () => {
  const [streamData, setStreamData] = useState(null);

  useEffect(() => {
    fetch('/api/stream/live')
      .then((res) => res.json())
      .then((data) => setStreamData(data))
      .catch((err) => console.error('Stream load failed', err));
  }, []);

  return (
    <div style={{ backgroundColor: '#000', color: '#FFD700', padding: '20px' }}>
      <h1>Live Stream</h1>
      {streamData ? (
        <StreamPlayer src={streamData.url} />
      ) : (
        <p>No live streams currently airing.</p>
      )}
    </div>
  );
};

export default StreamPage;
