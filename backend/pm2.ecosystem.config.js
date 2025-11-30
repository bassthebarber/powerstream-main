export default {
  apps: [{
    name: "powerstream-backend",
    script: "server.js",
    watch: ["server.js","routes","controllers","orchestrators","utils"],
    env: { NODE_ENV: "development", PORT: 5001 },
    env_production: { NODE_ENV: "production", PORT: 5001 }
  }]
};
