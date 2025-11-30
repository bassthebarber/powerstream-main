// frontend/override/OverrideHealthMonitor.js

import { useEffect, useState } from 'react';
import axios from 'axios';

const OverrideHealthMonitor = () => {
  const [health, setHealth] = useState({});

  useEffect(() => {
    const fetchHealth = async () => {
      const res = await axios.get('/api/override/health');
      setHealth(res.data);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ color: '#0f0' }}>
      <h4>System Health:</h4>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </div>
  );
};

export default OverrideHealthMonitor;
