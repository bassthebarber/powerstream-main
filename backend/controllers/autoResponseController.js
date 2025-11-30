// backend/controllers/autoResponseController.js
import AutoResponse from "../models/AutoResponsemodel.js";

exports.addResponse = async (req, res) => {
  try {
    const { trigger, response, createdBy } = req.body;
    const newResponse = new AutoResponse({ trigger, response, createdBy });
    const saved = await newResponse.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error saving auto-response:', error);
    res.status(500).json({ error: 'Failed to save auto-response' });
  }
};

exports.getAutoResponses = async (req, res) => {
  try {
    const responses = await AutoResponse.find().sort({ createdAt: -1 });
    res.status(200).json(responses);
  } catch (error) {
    console.error('Error fetching auto-responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
};
