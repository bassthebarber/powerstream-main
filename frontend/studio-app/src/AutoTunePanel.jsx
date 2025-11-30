import React, { useState } from 'react';
import axios from 'axios';

export default function AutoTunePanel() {
  const [path, setPath] = useState('');
  const [result, setResult] = useState('');

  const tune = async () => {
    const res = await axios.post('/api/autotune', { audioPath: path });
    setResult(res.data.tuned);
  };

  return (
    <div>
      <input placeholder="Raw audio path" onChange={(e) => setPath(e.target.value)} />
      <button onClick={tune}>AutoTune It</button>
      <p>New File: {result}</p>
    </div>
  );
}
