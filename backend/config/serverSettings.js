// backend/config/serverSettings.js
module.exports = {
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  helmetOptions: {},
  rateLimitOptions: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
};
