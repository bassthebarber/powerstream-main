import React from 'react';
import { initiateCopilot } from '../core/CopilotOverrideCore';

const AutopilotIgnitionButton = () => {
  const handleClick = () => {
    initiateCopilot("autopilot");
  };

  return (
    <button className="autopilot-ignite-button" onClick={handleClick}>
      🚀 Ignite Autopilot
    </button>
  );
};

export default AutopilotIgnitionButton;


