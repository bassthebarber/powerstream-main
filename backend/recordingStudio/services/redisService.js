// backend/services/redisService.js
import Redis from 'ioredis';
const redis = new Redis();

export const cacheSession = async (sessionId, data) => {
  await redis.set(`studio:${sessionId}`, JSON.stringify(data));
};

export const getSession = async (sessionId) => {
  const data = await redis.get(`studio:${sessionId}`);
  return data ? JSON.parse(data) : null;
};
