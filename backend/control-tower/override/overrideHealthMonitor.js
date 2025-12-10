// backend/control-tower/override/overrideHealthMonitor.js

import os from 'os';

export const getOverrideHealth = () => {
  return {
    uptime: process.uptime(),
    load: os.loadavg(),
    memory: {
      free: os.freemem(),
      total: os.totalmem()
    },
    platform: os.platform(),
    status: 'OK'
  };
};

export default { getOverrideHealth };
