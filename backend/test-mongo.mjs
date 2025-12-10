import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI || (() => {
  const encU = encodeURIComponent(process.env.MONGO_USER || '');
  const encP = encodeURIComponent(process.env.MONGO_PASS || '');
  const host = process.env.MONGO_HOST || 'cluster0.ldmtan.mongodb.net';
  const db   = process.env.MONGO_DB   || 'powerstream';
  const app  = process.env.MONGO_APP  || 'Cluster0';
  const auth = (process.env.MONGO_AUTH_SOURCE || '').trim();
  if (!encU || !encP) return '';
  const base = `mongodb+srv://${encU}:${encP}@${host}/${db}?retryWrites=true&w=majority&appName=${encodeURIComponent(app)}`;
  return auth ? `${base}&authSource=${encodeURIComponent(auth)}` : base;
})();

if (!uri) {
  console.error('No Mongo URI or split creds set in .env');
  process.exit(1);
}

console.log('Connecting to MongoDB…');
try {
  const t0 = Date.now();
  await mongoose.connect(uri, { maxPoolSize: 2 });
  console.log('✅ Connected in', Date.now() - t0, 'ms');
  await mongoose.disconnect();
  process.exit(0);
} catch (e) {
  console.error('❌ FAILED:', e.message);
  if (e?.reason?.codeName) console.error('   codeName:', e.reason.codeName);
  if (e?.code) console.error('   code:', e.code);
  process.exit(1);
}
