import mongoose from "mongoose";

const feedSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Feed = mongoose.model('Feed', feedSchema);
export default Feed;
