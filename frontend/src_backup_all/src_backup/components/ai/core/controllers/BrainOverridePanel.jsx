import React from 'react';

const BrainOverridePanel = () => {
  return (
    <div>
      <h3>Override Panel</h3>
      <button onClick={() => alert("Manual Override Engaged")}>
        Engage Override
      </button>
    </div>
  );
};

export default BrainOverridePanel;


