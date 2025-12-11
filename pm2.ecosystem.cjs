module.exports = {
  apps: [
    {
      name: "ps-backend",
      cwd: "./backend",
      script: "server.js",
      node_args: "--enable-source-maps",
      env: { NODE_ENV: "development", PORT: "5001" }
    },
    {
      name: "ps-frontend",
      cwd: "./frontend",
      script: "./node_modules/vite/bin/vite.js",
      args: "--port 3000 --strictPort --host",
      env: { NODE_ENV: "development" }
    },
    {
      name: "ps-frontend-preview",
      cwd: "./frontend",
      script: "./node_modules/vite/bin/vite.js",
      args: "preview --port 3002 --strictPort --host",
      env: { NODE_ENV: "production" },
      autorestart: false
    }
  ]
};
