// backend/controllers/tipsController.js

import User from "../models/Usermodel.js";
import Tip from "../models/Tipmodel.js";
import logUplink from "../logs/logUplink.js";

export const sendTip = async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, message } = req.body;

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) return res.status(404).json({ error: 'User not found' });
    if (fromUser.coins < amount) return res.status(400).json({ error: 'Insufficient coins' });

    fromUser.coins -= amount;
    toUser.coins += amount;

    await fromUser.save();
    await toUser.save();

    const tip = new Tip({
      from: fromUserId,
      to: toUserId,
      amount,
      message,
    });

    await tip.save();
    logUplink('TipsController', 'info', `💰 Tip sent from ${fromUserId} to ${toUserId}`);

    res.status(200).json({ success: true, tip });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
