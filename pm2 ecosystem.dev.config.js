module.exports = {
  apps: [
    {
      name: "ps-backend",
      cwd: "./backend",
      script: "server.js",
      node_args: "--enable-source-maps",
      watch: true,
      ignore_watch: ["node_modules", "logs"],
      env: { NODE_ENV: "development", PORT: "5008" }
    },
    {
      name: "ps-frontend",
      cwd: "./frontend",
      // On Windows PM2, npm.cmd is safer; on mac/linux just "npm"
      script: process.platform === "win32" ? "npm.cmd" : "npm",
      args: "run dev",
      env: { NODE_ENV: "development", PORT: "3000" }
    }
  ]
};
