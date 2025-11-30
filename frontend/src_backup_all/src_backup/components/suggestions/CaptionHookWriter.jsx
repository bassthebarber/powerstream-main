// frontend/src/components/suggestions/CaptionHookWriter.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function CaptionHookWriter() {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('');
  const [result, setResult] = useState(null);

  const generateHook = async () => {
    const res = await axios.post('/api/suggest/captionhook', { topic, genre });
    setResult(res.data);
  };

  return (
    <div className="caption-hook-writer">
      <h2>🧠 Caption & Hook Generator</h2>
      <input placeholder="Enter topic (e.g. love, hustle)" value={topic} onChange={e => setTopic(e.target.value)} />
      <input placeholder="Enter genre (e.g. trap, r&b)" value={genre} onChange={e => setGenre(e.target.value)} />
      <button onClick={generateHook}>Generate Caption</button>

      {result && (
        <div className="results">
          <p><strong>Title:</strong> {result.title}</p>
          <p><strong>Hashtags:</strong> {result.hashtags.join(' ')}</p>
          <p><strong>Hook:</strong> {result.hook}</p>
        </div>
      )}
    </div>
  );
}
