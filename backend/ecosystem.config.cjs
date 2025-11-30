module.exports = {
  apps: [{
    name: "powerstream-backend",
    script: "server.js",
    env: { PORT: 5001, NODE_ENV: "production" },
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: "10s",
    restart_delay: 2000,
  }]
};
