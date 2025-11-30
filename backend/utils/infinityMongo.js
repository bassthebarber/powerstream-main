import mongoose from 'mongoose';

const RETRY_MS = 3000;

export async function connectInfinity(uri) {
  if (!uri) throw new Error('Missing MONGO_URI');
  mongoose.set('strictQuery', false);

  const tryConnect = async () => {
    try {
      console.log('🟡 MongoDB: connecting…');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('🟢 MongoDB: connected');
    } catch (err) {
      console.error('🔴 MongoDB: connect error:', err.message);
      console.log(`⟳ Retrying in ${RETRY_MS / 1000}s…`);
      setTimeout(tryConnect, RETRY_MS);
    }
  };

  mongoose.connection.on('disconnected', () => {
    console.warn('🟠 MongoDB: disconnected — retrying…');
    setTimeout(tryConnect, RETRY_MS);
  });

  await tryConnect();
}
