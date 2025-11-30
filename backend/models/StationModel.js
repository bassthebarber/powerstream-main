import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  layout: { type: Object, default: {} },
  streamKey: { type: String, unique: true },
  isLive: { type: Boolean, default: false },
  playlist: { type: Array, default: [] }
}, { timestamps: true });

const Station = mongoose.model('Station', stationSchema);
export default Station;
