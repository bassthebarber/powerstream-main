import Withdrawal from '../models/withdrawalModel.js';

// @desc    Create a new withdrawal request
// @route   POST /api/withdrawals
// @access  Public or Authenticated User
export const createWithdrawal = async (req, res) => {
  try {
    const { userId, amount, method, status } = req.body;

    if (!userId || !amount || !method) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const withdrawal = new Withdrawal({
      userId,
      amount,
      method,
      status: status || 'pending',
    });

    await withdrawal.save();

    res.status(201).json({
      message: 'Withdrawal request created successfully',
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all withdrawal requests (for admin or dashboard)
// @route   GET /api/withdrawals
// @access  Admin
export const getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve withdrawals', error: error.message });
  }
};
