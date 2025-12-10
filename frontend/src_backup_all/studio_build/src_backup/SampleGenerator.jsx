import React, { useState } from 'react';
import axios from 'axios';

export default function SampleGenerator() {
  const [samples, setSamples] = useState([]);

  const handleSample = async () => {
    const res = await axios.post('/api/sample', {
      trackPath: '/uploads/oldschool.mp3'
    });
    setSamples(res.data.samples);
  };

  return (
    <div>
      <h2>🎚️ Sample AI Engine</h2>
      <button onClick={handleSample}>Analyze & Sample</button>
      <ul>
        {samples.map((s, i) => (
          <li key={i}>{s.name} [{s.start} - {s.end}] sec</li>
        ))}
      </ul>
    </div>
  );
}
