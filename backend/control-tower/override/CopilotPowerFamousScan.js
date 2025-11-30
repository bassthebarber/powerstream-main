// File: /backend/control-tower/override/CopilotPowerFamousScan.js

import Reel from "../../models/Reelmodel.js";
import User from "../../models/Usermodel.js";

// 🔁 MAIN OVERRIDE SCAN FUNCTION
const scanForPowerFamous = async () => {
  try {
    const reels = await Reel.find().populate("uploader");

    for (const reel of reels) {
      const views = reel.views || 0;
      const likes = reel.likes || 0;

      const qualifies = views >= 100000 && likes >= 25000;
      if (qualifies) {
        const user = await User.findById(reel.uploader._id);
        if (user && !user.badges.includes("PowerFamous")) {
          user.badges.push("PowerFamous");
          await user.save();
          console.log(
            `🔥 User ${user.username || user.name} awarded PowerFamous badge!`
          );
        }
      }
    }
  } catch (err) {
    console.error("❌ PowerFamous Scan Failed:", err.message);
  }
};

export default scanForPowerFamous;
