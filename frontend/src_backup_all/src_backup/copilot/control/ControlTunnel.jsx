// frontend/src/copilot/control/ControlTunnel.jsx
import React from 'react';

const ControlTunnel = ({ status }) => {
  return (
    <div style={{ background: '#111', color: '#0f0', padding: '20px' }}>
      <strong>🌀 Tunnel Status:</strong> {status}
    </div>
  );
};

export default ControlTunnel;


