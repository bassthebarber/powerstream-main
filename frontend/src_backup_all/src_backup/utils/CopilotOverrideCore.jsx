// frontend/src/copilot/CopilotOverrideCore.js
import axios from 'axios';

export const triggerFullSystemBuild = async () => {
  try {
    const res = await axios.post('/api/copilot/override/activate', {
      command: "launch-full-build"
    });
    console.log("🚀 System build triggered:", res.data);
  } catch (err) {
    console.error("❌ Build trigger failed:", err.message);
  }
};


