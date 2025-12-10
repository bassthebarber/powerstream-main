// frontend/src/pages/studio/GoLive.jsx
import React, { useState } from 'react';

export default function GoLive() {
  const [streamKey, setStreamKey] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(streamKey);
    alert('Stream key copied!');
  };

  const fetchStreamKey = async () => {
    const res = await fetch('/api/live/key');
    const data = await res.json();
    setStreamKey(data.key);
  };

  return (
    <div className="p-6 text-yellow-400">
      <h1 className="text-2xl font-bold mb-4">🎥 Go Live</h1>
      <button onClick={fetchStreamKey} className="bg-yellow-500 text-black px-4 py-2 rounded">Get Stream Key</button>
      {streamKey && (
        <div className="mt-4">
          <p className="mb-2">Your RTMP Stream Key:</p>
          <input value={streamKey} readOnly className="text-black w-full p-2" />
          <button onClick={handleCopy} className="mt-2 bg-black text-yellow-400 px-3 py-1">Copy</button>
        </div>
      )}
    </div>
  );
}
