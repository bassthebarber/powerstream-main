// backend/control-tower/override/overrideHealthMonitor.js

const os = require('os');

const getOverrideHealth = () => {
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

module.exports = { getOverrideHealth };
