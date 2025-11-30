// /backend/models/ClockIn.js
import mongoose from 'mongoose';

const ClockInSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['engineer', 'producer', 'admin', 'legal', 'finance', 'creator'],
    required: true,
  },
  clockInTime: {
    type: Date,
    default: Date.now,
  },
  clockOutTime: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true
});

export default mongoose.model('ClockIn', ClockInSchema);
