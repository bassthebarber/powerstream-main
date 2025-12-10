import React from 'react';

const FailsafeSwitch = () => (
  <div className="failsafe-switch">
    <button onClick={() => alert('Failsafe Engaged — Lockdown Initiated')}>
      🔐 Engage Failsafe
    </button>
  </div>
);

export default FailsafeSwitch;


