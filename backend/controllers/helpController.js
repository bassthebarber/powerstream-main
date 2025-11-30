// backend/controllers/helpController.js

import HelpRequest from "../models/HelpRequest.js";
import logUplink from "../logs/logUplink.js";

exports.submitHelpRequest = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;

    const request = new HelpRequest({
      user: userId,
      subject,
      message,
    });

    await request.save();
    logUplink('HelpController', 'info', `🆘 Help request submitted by ${userId}`);

    res.status(200).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit help request' });
  }
};

exports.getAllHelpRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find().populate('user');
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
