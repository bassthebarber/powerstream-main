// frontend/components/stream/StreamCyborg.js
import React, { useState } from 'react';

export default function StreamCyborg({ onCommand }) {
  const [command, setCommand] = useState('');

  const handleCommand = () => {
    if (!command.trim()) return;
    if (onCommand) onCommand(command);
    setCommand('');
  };

  return (
    <div className="stream-cyborg">
      <h4>🤖 Stream Cyborg</h4>
      <input
        type="text"
        placeholder="Enter AI command..."
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
      />
      <button onClick={handleCommand}>Execute</button>
    </div>
  );
}


