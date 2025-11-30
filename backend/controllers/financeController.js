// backend/controllers/financeController.js
import Transaction from '../models/transactionModel.js';

export const getFinancialSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalPayouts = transactions.filter(tx => tx.type === 'payout').reduce((sum, tx) => sum + tx.amount, 0);

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        totalPayouts,
        netBalance: totalRevenue - totalPayouts,
        transactionCount: transactions.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate summary', details: err.message });
  }
};
