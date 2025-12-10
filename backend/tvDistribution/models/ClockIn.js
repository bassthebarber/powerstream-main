// backend/models/ClockIn.js
import mongoose from 'mongoose';


const clockInSchema = new mongoose.Schema({
userId: { type: String, required: true },
role: { type: String },
time: { type: Date, default: Date.now }
});


export default mongoose.model('ClockIn', clockInSchema);