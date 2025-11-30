import Payroll from '../models/Payroll.js';

// @desc    Process new payroll entry
// @route   POST /api/payroll
export const createPayroll = async (req, res) => {
  try {
    const payroll = new Payroll(req.body);
    await payroll.save();
    res.status(201).json({ message: 'Payroll recorded', payroll });
  } catch (err) {
    res.status(500).json({ error: 'Payroll processing failed' });
  }
};

// @desc    Get all payroll logs
// @route   GET /api/payroll
export const getPayrollLogs = async (req, res) => {
  try {
    const logs = await Payroll.find();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load payroll records' });
  }
};

// @desc    Get payroll for a specific employee
export const getPayrollByEmployee = async (req, res) => {
  try {
    const logs = await Payroll.find({ employeeId: req.params.id });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch employee payroll' });
  }
};
