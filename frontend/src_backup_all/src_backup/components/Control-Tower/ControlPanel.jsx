import React from 'react';
import CommandInputBox from './CommandInputBox';

const ControlPanel = () => {
  const handleCommand = (cmd) => {
    console.log('Executing command:', cmd);
    // Send to Copilot or Control Logic
  };

  return (
    <div className="hud-panel">
      <h3>Control Panel</h3>
      <CommandInputBox onSubmit={handleCommand} />
    </div>
  );
};

export default ControlPanel;


