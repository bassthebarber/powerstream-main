// backend/controllers/copilot/copilotOverrideActivate.js
import { exec } from 'child_process';
import path from 'path';

export const activateOverrideMode = async (req, res) => {
  try {
    console.log("⚙️ Copilot Override Triggered: AI Autopilot Mode Engaged");

    // Simulated build execution or sync command
    exec('npm run build-all', { cwd: path.resolve('../') }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Build error: ${error.message}`);
        return res.status(500).json({ error: 'Autopilot build failed' });
      }
      if (stderr) console.warn(`⚠️ Build stderr: ${stderr}`);
      console.log(`✅ Build stdout: ${stdout}`);
    });

    res.status(200).json({ message: "🧠 Copilot Override Activated. Autopilot Builder Mode Online." });
  } catch (err) {
    res.status(500).json({ error: "❌ Copilot Override Error", details: err.message });
  }
};
