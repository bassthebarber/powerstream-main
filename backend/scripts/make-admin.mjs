// backend/scripts/make-admin.mjs
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { email: null, revoke: false, list: false, ensure: false, password: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!opts.email && !a.startsWith('--')) { opts.email = a; continue; }
    if (a === '--revoke') opts.revoke = true;
    else if (a === '--list') opts.list = true;
    else if (a === '--ensure') opts.ensure = true;
    else if (a === '--password') { opts.password = args[i+1]; i++; }
  }
  return opts;
}

const { email: CLI_EMAIL, revoke, list, ensure, password } = parseArgs();
const email = CLI_EMAIL || process.env.ADMIN_EMAIL;
if (!email && !list) {
  console.error('Usage: node scripts/make-admin.mjs <email> [--revoke] [--ensure] [--password <pw>] OR with --list');
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/powerstream';

await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB || undefined });

let User;
// Try your real model first, fall back to a minimal one
try {
  const mod = await import('../models/User.js');
  User = mod.default || mod.User || mongoose.model('User');
} catch {
  const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, index: true },
    password: { type: String },
    isAdmin: { type: Boolean, default: false },
    name: { type: String }
  }, { collection: 'users', timestamps: true });
  try { User = mongoose.model('User'); } catch { User = mongoose.model('User', userSchema); }
}

try {
  if (list) {
    const admins = await User.find({ isAdmin: true }).select('email name isAdmin createdAt');
    console.log('👑 Admins:', admins.map(a => a.email));
    process.exit(0);
  }

  const setTo = !revoke;
  let result;

  const existing = await User.findOne({ email });

  if (!existing && ensure) {
    const plain = password || 'Power!2345';
    const hash = await bcrypt.hash(plain, 10);
    const created = await User.create({
      email,
      password: hash,
      isAdmin: true,
      name: email.split('@')[0]
    });
    result = { created: true, id: created._id.toString(), email: created.email, isAdmin: created.isAdmin };
    console.log('✅ Created user and granted admin:', result);
  } else if (!existing && !ensure) {
    const upd = await User.updateOne({ email }, { $set: { isAdmin: setTo } }, { upsert: false });
    result = { matched: upd.matchedCount, modified: upd.modifiedCount };
    console.log('ℹ️ User not found. No changes. (Use --ensure to create)', result);
  } else {
    const upd = await User.updateOne({ _id: existing._id }, { $set: { isAdmin: setTo } });
    result = { matched: upd.matchedCount, modified: upd.modifiedCount };
    console.log(revoke ? '✅ Admin revoked:' : '✅ Admin granted:', { email, ...result });
  }
} catch (err) {
  console.error('❌ make-admin error:', err?.message || err);
  process.exitCode = 1;
} finally {
  await mongoose.connection.close().catch(() => {});
}
