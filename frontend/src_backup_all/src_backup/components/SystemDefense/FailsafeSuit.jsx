import React, { useState } from 'react';
import FailsafeSwitch from './FailsafeSwitch';
import SystemRecovery from './SystemRecovery';
import CrashSensor from './CrashSensor';

const FailsafeSuit = () => {
  const [activated, setActivated] = useState(false);

  const handleActivation = () => {
    setActivated(true);
    SystemRecovery.rebootNow();
  };

  return (
    <div className="failsafe-suit">
      <h3>🛡️ Failsafe Suit</h3>
      <FailsafeSwitch onClick={handleActivation} />
      {activated && <CrashSensor />}
    </div>
  );
};

export default FailsafeSuit;


