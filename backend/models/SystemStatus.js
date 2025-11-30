import mongoose from 'mongoose';
const SystemStatusSchema = new mongoose.Schema({
  key: { type:String, unique:true },
  value: mongoose.Schema.Types.Mixed
}, { timestamps:true });
export default mongoose.model('SystemStatus', SystemStatusSchema);
