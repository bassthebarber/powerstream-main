// frontend/src/copilot/core/TriggerForceOverride.jsx
import React from 'react';

const TriggerForceOverride = ({ onForce }) => {
  return (
    <button
      onClick={onForce}
      style={{ backgroundColor: '#000', color: '#FFD700', padding: '12px', border: '2px solid #FFD700' }}
    >
      🔒 FORCE OVERRIDE
    </button>
  );
};

export default TriggerForceOverride;


