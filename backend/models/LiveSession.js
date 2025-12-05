// backend/models/LiveSession.js
// DEPRECATED: Model moved to /src/domain/models/StreamSession.model.js
// This file remains for backward compatibility with existing imports.
// TODO: Update all imports to use /src/domain/models/StreamSession.model.js
import mongoose from 'mongoose'

const LiveSessionSchema = new mongoose.Schema({
  artistName: String,
  streamKey: String,
  startedAt: { type: Date, default: Date.now },
  ended: { type: Boolean, default: false }
})

export default mongoose.model('LiveSession', LiveSessionSchema)
