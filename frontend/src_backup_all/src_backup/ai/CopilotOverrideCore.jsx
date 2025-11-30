// frontend/src/ai/CopilotOverrideCore.jsx
import React, { useEffect } from 'react';

const CopilotOverrideCore = () => {
  useEffect(() => {
    console.log("🛠️ Copilot Override Core Activated");
  }, []);

  return (
    <div>
      <h3>🛠️ Override Core</h3>
      <p>All Copilot instructions will now take top priority in builder mode.</p>
    </div>
  );
};

export default CopilotOverrideCore;


