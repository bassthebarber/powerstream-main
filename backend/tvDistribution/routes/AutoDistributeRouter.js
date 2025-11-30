// backend/tvDistribution/routes/autoDistributeRouter.js
import express from 'express';
const router = express.Router();


router.post('/auto-distribute', async (req, res) => {
try {
const { videoId, platforms } = req.body;
// Simulate distribution logic
res.json({ status: 'success', distributedTo: platforms });
} catch (err) {
res.status(500).json({ error: 'Distribution failed' });
}
});


export default router;