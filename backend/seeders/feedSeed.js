import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FeedPost from '../models/FeedPostModel.js';

dotenv.config();

const seedFeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await FeedPost.deleteMany();

    const samplePosts = [
      { authorName: 'Marcus Bass', content: 'Welcome to the new Feed!', image: '/images/sample1.jpg' },
      { authorName: 'Jane Doe', content: 'PowerStream is live!', image: '/images/sample2.jpg' },
      { authorName: 'John Smith', content: 'Testing AI build mode', image: '/images/sample3.jpg' }
    ];

    await FeedPost.insertMany(samplePosts);
    console.log('✅ Feed seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedFeed();
