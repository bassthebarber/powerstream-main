// frontend/src/ai/RunCommand.jsx
import React, { useState } from 'react';

const RunCommand = () => {
  const [command, setCommand] = useState("");

  const handleRun = () => {
    console.log(`🏃 Running command: ${command}`);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Copilot command..."
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        style={{ marginRight: "10px", padding: "6px" }}
      />
      <button onClick={handleRun}>Run 🧠</button>
    </div>
  );
};

export default RunCommand;


