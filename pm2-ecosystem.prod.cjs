module.exports = {
  apps: [
    {
      name: "ps-backend",
      cwd: "./backend",
      script: "server.js",
      node_args: "--enable-source-maps",
      env: { NODE_ENV: "production", PORT: "5001" }
    },
    {
      name: "ps-worker-autopilot",
      cwd: "./backend",
      script: "jobs/autopilotWorker.mjs",
      interpreter: "node",
      autorestart: true,
      watch: false,
      cron_restart: "*/30 * * * *", // every 30 minutes
      env: { NODE_ENV: "production" }
    },
    {
      // Vite preview serving frontend build on 3002
      name: "ps-frontend",
      cwd: "./frontend",
      script: "node_modules/vite/bin/vite.js",
      args: "preview --strictPort --port 3002",
      env: { NODE_ENV: "production" }
    }
  ]
};
