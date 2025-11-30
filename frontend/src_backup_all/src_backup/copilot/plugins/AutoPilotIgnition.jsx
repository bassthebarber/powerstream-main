import { useEffect } from 'react';
import { initiateCopilot } from '../core/CopilotOverrideCore';

const AutoPilotIgnition = () => {
  useEffect(() => {
    console.log("🧠 Autopilot ignition triggered...");
    initiateCopilot("autopilot");
  }, []);

  return null;
};

export default AutoPilotIgnition;


