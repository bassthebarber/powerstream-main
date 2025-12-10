import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ReelVideo from '../models/ReelVideoModel.js';

dotenv.config();

const seedReels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await ReelVideo.deleteMany();

    const sampleReels = [
      { videoUrl: '/videos/reel1.mp4', caption: 'Power moves' },
      { videoUrl: '/videos/reel2.mp4', caption: 'Behind the scenes' },
      { videoUrl: '/videos/reel3.mp4', caption: 'AI in action' }
    ];

    await ReelVideo.insertMany(sampleReels);
    console.log('✅ Reels seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedReels();
