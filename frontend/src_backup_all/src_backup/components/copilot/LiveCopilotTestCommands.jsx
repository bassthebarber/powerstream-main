import React, { useState } from 'react';
import MatrixOverride from '../Matrix/MatrixOverride';

const LiveCopilotTestCommands = () => {
  const [inputCommand, setInputCommand] = useState('');

  const handleRun = () => {
    console.log(`🧠 Sending: ${inputCommand}`);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter AI command..."
        value={inputCommand}
        onChange={(e) => setInputCommand(e.target.value)}
      />
      <button onClick={handleRun}>Send to MatrixOverride</button>
      <MatrixOverride command={inputCommand} />
    </div>
  );
};

export default LiveCopilotTestCommands;


