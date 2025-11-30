// backend/controllers/ClockInController.js
import ClockIn from '../tvDistribution/models/ClockIn.js';


export const clockInUser = async (req, res) => {
try {
const { userId, role } = req.body;
const newClockIn = new ClockIn({ userId, role });
await newClockIn.save();
res.status(200).json(newClockIn);
} catch (error) {
res.status(500).json({ error: error.message });
}
};