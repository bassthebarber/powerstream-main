// frontend/override/OverrideStateRecovery.js

import { useEffect } from 'react';

const OverrideStateRecovery = ({ onRecover }) => {
  useEffect(() => {
    const hasCrashed = localStorage.getItem('override_crash');
    if (hasCrashed === 'true') {
      onRecover?.();
      localStorage.setItem('override_crash', 'false');
    }
  }, []);

  return null;
};

export default OverrideStateRecovery;
