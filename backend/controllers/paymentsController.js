// backend/controllers/paymentsController.js

import Payment from "../models/Payment.js";
import logUplink from "../logs/logUplink.js";

exports.recordPayment = async (req, res) => {
  try {
    const { userId, amount, method, transactionId } = req.body;

    const payment = new Payment({
      user: userId,
      amount,
      method,
      transactionId,
    });

    await payment.save();
    logUplink('PaymentsController', 'info', `💳 Payment recorded for ${userId}`);

    res.status(200).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ user: userId });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
