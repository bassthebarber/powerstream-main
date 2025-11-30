// frontend/override/OverrideBootPanel.js

import React, { useState } from 'react';

const OverrideBootPanel = ({ onTrigger }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', padding: '10px' }}>
      <button onClick={() => setVisible(!visible)}>Toggle Override Panel</button>
      {visible && (
        <div>
          <h3>Override Commands</h3>
          <button onClick={() => onTrigger('boot')}>🔌 Boot System</button>
          <button onClick={() => onTrigger('heal')}>💉 Heal AI</button>
          <button onClick={() => onTrigger('reset')}>♻️ Reset Override</button>
        </div>
      )}
    </div>
  );
};

export default OverrideBootPanel;
