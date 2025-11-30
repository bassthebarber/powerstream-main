// frontend/override/OverrideStatusWidget.js

import React from 'react';

const OverrideStatusWidget = ({ status }) => {
  return (
    <div style={{ backgroundColor: '#111', color: '#0f0', padding: '10px', borderRadius: '5px' }}>
      <h3>Override System Status</h3>
      <ul>
        {Object.entries(status).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value ? '✅ Active' : '❌ Inactive'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OverrideStatusWidget;
