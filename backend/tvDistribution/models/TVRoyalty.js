// backend/models/TVRoyalty.js
import mongoose from 'mongoose';


const tvRoyaltySchema = new mongoose.Schema({
contentId: { type: String, required: true },
views: { type: Number, default: 0 },
ratePerView: { type: Number, required: true },
payout: { type: Number, default: 0 },
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('TVRoyalty', tvRoyaltySchema);