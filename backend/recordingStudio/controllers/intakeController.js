import Intake from '../models/Intake.js';

// @desc    Register intake application
// @route   POST /api/intake/register
export const registerIntake = async (req, res) => {
  try {
    const intake = new Intake(req.body);
    await intake.save();
    res.status(201).json({ message: 'Application submitted', intake });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit intake form' });
  }
};

// @desc    Get all intake applicants
// @route   GET /api/intake
export const getAllIntakes = async (req, res) => {
  try {
    const intakes = await Intake.find();
    res.status(200).json(intakes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch intake records' });
  }
};

// @desc    Approve or deny intake
// @route   PATCH /api/intake/:id
export const updateIntakeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Intake.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update intake status' });
  }
};
