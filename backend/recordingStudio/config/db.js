// config/db.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is missing');

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    // modern drivers need few/no options
  });
  console.log('🗄  MongoDB connected (Studio)');
};
