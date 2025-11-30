import mongoose from 'mongoose';

const feedPostSchema = new mongoose.Schema({
  authorName: String,
  content: String,
  image: String
}, { timestamps: true });

export default mongoose.model('FeedPost', feedPostSchema);
