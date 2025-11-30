// frontend/override/OverrideSignalSync.js

import { useEffect } from 'react';
import axios from 'axios';

const OverrideSignalSync = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      axios.post('/api/override/ping', { timestamp: Date.now() });
    }, 10000); // every 10 sec
    return () => clearInterval(interval);
  }, []);

  return null;
};

export default OverrideSignalSync;
