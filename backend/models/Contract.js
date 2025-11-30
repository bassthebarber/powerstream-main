// backend/models/Contract.js

import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  producerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: { type: String, required: true },
  terms: { type: String, required: true },
  royaltySplit: {
    platform: { type: Number, default: 30 },
    artist: { type: Number, default: 60 },
    producer: { type: Number, default: 10 }
  },
  signed: {
    artist: { type: Boolean, default: false },
    producer: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

const Contract = mongoose.model('Contract', contractSchema);
export default Contract;
