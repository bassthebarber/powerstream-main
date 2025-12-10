// backend/controllers/TVRoyaltyController.js
import TVRoyalty from '../models/TVRoyalty.js';


export const calculateRoyalties = async (req, res) => {
try {
const { contentId, views, ratePerView } = req.body;
const payout = views * ratePerView;


const newRoyalty = new TVRoyalty({
contentId,
views,
ratePerView,
payout
});


await newRoyalty.save();
res.status(201).json(newRoyalty);
} catch (err) {
res.status(500).json({ error: err.message });
}
};