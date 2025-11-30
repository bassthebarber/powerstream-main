import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employeeId: String,
  hoursWorked: Number,
  hourlyRate: Number,
  grossPay: Number,
  taxes: {
    federal: Number,
    state: Number,
    medicare: Number,
    ssn: Number,
  },
  netPay: Number,
  paymentMethod: String,
  payoutIdentifier: String,
  payPeriodStart: Date,
  payPeriodEnd: Date,
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('Payroll', payrollSchema);
