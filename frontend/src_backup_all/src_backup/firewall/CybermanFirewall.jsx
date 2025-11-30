// src/firewall/CybermanFirewall.js
import React from 'react';
import './firewall.css';
import useCyberDefense from './useCyberDefense';

export default function CybermanFirewall() {
  useCyberDefense();

  return (
    <div className="cyberman-firewall">
      <h3>🛡️ Cyberman Firewall Active</h3>
      <p>Real-time threat monitoring and defense is online.</p>
    </div>
  );
}


