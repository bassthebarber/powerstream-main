// backend/models/LiveSession.js
import mongoose from 'mongoose'

const LiveSessionSchema = new mongoose.Schema({
  artistName: String,
  streamKey: String,
  startedAt: { type: Date, default: Date.now },
  ended: { type: Boolean, default: false }
})

export default mongoose.model('LiveSession', LiveSessionSchema)
