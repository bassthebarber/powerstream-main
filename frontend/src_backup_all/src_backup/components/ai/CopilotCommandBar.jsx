import React, { useState } from 'react';
import './CopilotCommandBar.css';

const CopilotCommandBar = ({ onCommand }) => {
  const [command, setCommand] = useState('');

  const handleExecute = () => {
    if (command.trim()) {
      onCommand(command);   // send to your AI backend
      setCommand('');
    }
  };

  return (
    <div className="copilot-bar">
      <input
        className="copilot-input"
        type="text"
        placeholder="Enter Copilot command..."
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />
      <button className="copilot-btn" onClick={handleExecute}>
        Execute
      </button>
    </div>
  );
};

export default CopilotCommandBar;


