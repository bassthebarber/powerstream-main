import mongoose from 'mongoose';

const gramPhotoSchema = new mongoose.Schema({
  imageUrl: String,
  caption: String
}, { timestamps: true });

export default mongoose.model('GramPhoto', gramPhotoSchema);
