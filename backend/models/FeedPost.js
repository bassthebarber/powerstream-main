import mongoose from "mongoose";

const FeedPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  userAvatar: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  mediaUrl: {
    type: String,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      username: String,
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const FeedPost = mongoose.model('FeedPost', FeedPostSchema);
export default FeedPost;
