const mongoose = require('mongoose');

const FeedPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // make sure you have a User model
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  userAvatar: {
    type: String, // Cloudinary URL or file path
  },
  content: {
    type: String,
    required: true,
  },
  mediaUrl: {
    type: String, // optional image or video
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

module.exports = mongoose.model('FeedPost', FeedPostSchema);
