/ backend/services/payrollService.js
import ClockIn from '../models/ClockIn.js';


export const calculatePayroll = async (userId) => {
const logs = await ClockIn.find({ userId });
const rate = 15; // $15/hour or custom rate
const totalHours = logs.length;
return {
userId,
totalHours,
totalPay: totalHours * rate
};
};