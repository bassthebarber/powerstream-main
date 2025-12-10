// frontend/src/copilot/dashboard/CopilotDashboard.jsx
import React from 'react';
import CopilotOverrideCore from '../core/CopilotOverrideCore';
import CopilotValidatorTrigger from '../core/CopilotValidatorTrigger';

const CopilotDashboard = () => {
  return (
    <div style={{ background: '#000', color: '#FFD700', padding: '20px' }}>
      <h2>🧠 PowerStream Copilot Dashboard</h2>
      <CopilotOverrideCore />
      <CopilotValidatorTrigger />
    </div>
  );
};

export default CopilotDashboard;


