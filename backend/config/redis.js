// backend/config/redis.js
// TODO: Config normalized to env.js for consistency.
// DEPRECATED: This file is being replaced by /src/config/redis.js
// It remains for backward compatibility with existing imports.
import { createClient } from 'redis';
import env from '../src/config/env.js';

let client = null;

export const initRedis = async () => {
  if (!env.USE_REDIS) {
    console.log('ℹ️ initRedis: disabled by USE_REDIS=false');
    return null;
  }
  if (client) return client;
  
  const host = env.REDIS_HOST;
  const port = env.REDIS_PORT;
  const password = env.REDIS_PASSWORD || undefined;
  
  client = createClient({ 
    socket: { host, port },
    password: password || undefined,
  });
  client.on('error', (e) => console.error('❌ Redis Error:', e));
  await client.connect();
  console.log('🟢 Redis: connected');
  return client;
};

export const getRedis = () => client;

export const isRedisConnected = () => client?.isOpen ?? false;

export default { initRedis, getRedis, isRedisConnected };
