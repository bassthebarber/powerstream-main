import mongoose from 'mongoose';
const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  kind: { type: String, enum: ['mic','speaker','midi','interface','other'], default: 'other' },
  meta: { type: mongoose.Schema.Types.Mixed },
  userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},{ timestamps:true });
export const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);
