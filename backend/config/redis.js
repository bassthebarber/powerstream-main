// config/redis.js
import { createClient } from 'redis';

let client = null;

export const initRedis = async () => {
  if (process.env.USE_REDIS !== 'true') {
    console.log('ℹ️ initRedis: disabled by USE_REDIS=false');
    return null;
  }
  if (client) return client;
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = Number(process.env.REDIS_PORT || 6379);
  client = createClient({ socket: { host, port } });
  client.on('error', (e) => console.error('❌ Redis Error:', e));
  await client.connect();
  return client;
};

export const getRedis = () => client;
export default { initRedis, getRedis };
