import PowerGramPost from "../models/PowerGramPost.js";
import { cloudinary } from "../utils/cloudinary.js";

export const getPosts = async (req, res) => {
  const posts = await PowerGramPost.find().sort({ createdAt: -1 });
  res.json(posts);
};

export const uploadPost = async (req, res) => {
  const result = await cloudinary.uploader.upload(req.file.path);
  const newPost = new PowerGramPost({
    imageUrl: result.secure_url,
    caption: req.body.caption,
    uploader: req.user._id,
  });
  await newPost.save();
  res.status(201).json({ message: "Post created" });
};
