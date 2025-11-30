import Employee from '../models/Employee.js';

// @desc    Hire new employee
// @route   POST /api/employees
export const hireEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Hiring failed' });
  }
};

// @desc    Fire employee
// @route   DELETE /api/employees/:id
export const fireEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee terminated' });
  } catch (err) {
    res.status(500).json({ error: 'Termination failed' });
  }
};

// @desc    Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch employee records' });
  }
};
