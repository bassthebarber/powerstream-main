import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('No MONGO_URI in env');
  process.exit(1);
}

console.log('Connecting to MongoDB…');
try {
  const start = Date.now();
  await mongoose.connect(uri, { maxPoolSize: 2 });
  console.log('Connected in', Date.now() - start, 'ms');
  await mongoose.disconnect();
  process.exit(0);
} catch (e) {
  console.error('FAILED:', e.message);
  if (e?.reason?.codeName) console.error('codeName:', e.reason.codeName);
  if (e?.code) console.error('code:', e.code);
  process.exit(1);
}
