import React from 'react';

const OverrideTrigger = ({ onTrigger }) => {
  return (
    <button onClick={onTrigger} className="hud-panel">
      Activate Override
    </button>
  );
};

export default OverrideTrigger;


