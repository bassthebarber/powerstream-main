import React from 'react';

const CopilotUIBar = ({ status = 'Idle' }) => {
  return (
    <div className="hud-panel">
      <strong>Copilot Status:</strong> {status}
    </div>
  );
};

export default CopilotUIBar;


