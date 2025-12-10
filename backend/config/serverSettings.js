// backend/config/serverSettings.js
export const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

export const helmetOptions = {};

export const rateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  max: 100,
};

export default {
  corsOptions,
  helmetOptions,
  rateLimitOptions,
};
