import React from 'react';

const PowerMergeTrigger = ({ onActivate }) => {
  return (
    <button className="power-merge-trigger" onClick={onActivate}>
      🔄 Merge All Systems & Sync
    </button>
  );
};

export default PowerMergeTrigger;


