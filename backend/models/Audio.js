const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
  title: String,
  artist: String,
  url: String
}, { timestamps: true });

module.exports = mongoose.model('Audio', audioSchema);
