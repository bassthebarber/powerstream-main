import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: String,
  role: String,
  hourlyRate: Number,
  status: {
    type: String,
    enum: ['active', 'terminated'],
    default: 'active'
  }
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
