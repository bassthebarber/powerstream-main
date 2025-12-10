// utils/redis.js
import { createClient } from 'redis';

let client = null;

export const getRedis = async () => {
  if (process.env.USE_REDIS !== 'true') return null; // disabled by default

  if (client) return client;

  client = createClient({
    socket: { host: process.env.REDIS_HOST || '127.0.0.1', port: Number(process.env.REDIS_PORT) || 6379 },
  });

  client.on('error', (err) => console.error('Redis error (Studio):', err));
  await client.connect();
  console.log('🧠 Redis connected (Studio)');
  return client;
};
