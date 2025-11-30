// sample.js

import mongoose from 'mongoose';

const sampleSchema = new mongoose.Schema({
  originalTrack: {
    type: String,
    required: true,
    description: "Original song or track used for sampling"
  },
  sampleSnippetURL: {
    type: String,
    required: true,
    description: "Link to the generated sample file"
  },
  genre: {
    type: String,
    default: "unknown"
  },
  bpm: {
    type: Number,
    description: "Beats per minute of the sample"
  },
  key: {
    type: String,
    description: "Musical key of the sample"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rightsCleared: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Sample = mongoose.model('Sample', sampleSchema);

export default Sample;
