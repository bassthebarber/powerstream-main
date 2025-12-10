// frontend/src/pages/stations/CreateStation.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateStation() {
  const [name, setName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const navigate = useNavigate();

  const handleCreate = () => {
    fetch('/api/stations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, streamUrl })
    })
      .then(res => res.json())
      .then(() => {
        alert('Station created successfully!');
        navigate('/stations');
      })
      .catch(err => console.error('Create station error:', err));
  };

  return (
    <div className="create-station">
      <h2>Create New Station</h2>
      <input
        type="text"
        placeholder="Station Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Stream URL"
        value={streamUrl}
        onChange={e => setStreamUrl(e.target.value)}
      />
      <button onClick={handleCreate}>Create Station</button>
    </div>
  );
}
