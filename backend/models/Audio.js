import mongoose from "mongoose";

const audioSchema = new mongoose.Schema({
  title: String,
  artist: String,
  url: String
}, { timestamps: true });

const Audio = mongoose.model('Audio', audioSchema);
export default Audio;
