// backend/controllers/systemController.js

const os = require('os');
import logUplink from "../logs/logUplink.js";

exports.getSystemStatus = (req, res) => {
  const uptime = os.uptime();
  const memoryUsage = process.memoryUsage();
  const load = os.loadavg();

  const systemInfo = {
    uptime,
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: memoryUsage.rss,
    },
    load,
    platform: os.platform(),
    arch: os.arch(),
  };

  logUplink('SystemController', 'debug', 'System status checked');
  res.status(200).json(systemInfo);
};
