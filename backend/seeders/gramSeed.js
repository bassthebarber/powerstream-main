import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GramPhoto from '../models/GramPhotoModel.js';

dotenv.config();

const seedGram = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await GramPhoto.deleteMany();

    const samplePhotos = [
      { imageUrl: '/images/gram1.jpg', caption: 'Sunset vibes' },
      { imageUrl: '/images/gram2.jpg', caption: 'PowerStream style' },
      { imageUrl: '/images/gram3.jpg', caption: 'Dream big' }
    ];

    await GramPhoto.insertMany(samplePhotos);
    console.log('✅ Gram seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedGram();
