module.exports = {
  apps: [
    {
      name: "powerstream-api",
      script: "server.js",
      cwd: "/path/to/backend",
      env: { NODE_ENV: "production" }
    },
    {
      name: "powerstream-media",
      script: "mediaServer.js",
      cwd: "/path/to/backend",
      env: { NODE_ENV: "production" }
    }
  ]
};
