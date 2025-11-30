import mongoose from 'mongoose';

const intakeSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  position: String,
  message: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('Intake', intakeSchema);
