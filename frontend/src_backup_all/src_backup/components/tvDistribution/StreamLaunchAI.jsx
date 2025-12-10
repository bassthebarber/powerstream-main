import React, { useState } from 'react';

export default function StreamLaunchAI() {
  const [title, setTitle] = useState('');
  const [stationId, setStationId] = useState('');
  const [status, setStatus] = useState('');

  const handleLaunch = async () => {
    try {
      const res = await fetch('/api/tv/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, stationId }),
      });
      const data = await res.json();
      setStatus(data.message || 'Stream launched!');
    } catch (error) {
      console.error('Launch error:', error);
      setStatus('Failed to launch stream.');
    }
  };

  return (
    <div className="stream-launch-ai">
      <h2>🚀 Launch Smart TV Stream</h2>
      <input
        type="text"
        placeholder="Stream Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Station ID"
        value={stationId}
        onChange={(e) => setStationId(e.target.value)}
      />
      <button onClick={handleLaunch}>Launch Stream</button>
      {status && <p>{status}</p>}
    </div>
  );
}
