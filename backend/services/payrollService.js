// backend/services/payrollService.js
export function calculatePayroll({ hoursWorked, hourlyRate, bonuses = 0 }) {
  const grossPay = hoursWorked * hourlyRate + bonuses;
  const tax = grossPay * 0.15;
  const netPay = grossPay - tax;

  return {
    grossPay,
    tax,
    netPay,
    breakdown: {
      hoursWorked,
      hourlyRate,
      bonuses
    }
  };
}
