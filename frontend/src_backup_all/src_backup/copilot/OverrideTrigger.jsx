// frontend/src/copilot/core/OverrideTrigger.jsx
import React from 'react';

const OverrideTrigger = ({ onTrigger }) => {
  return (
    <button
      onClick={onTrigger}
      style={{ backgroundColor: '#f00', color: '#fff', padding: '12px', marginTop: '20px' }}
    >
      🚨 Trigger Override
    </button>
  );
};

export default OverrideTrigger;


