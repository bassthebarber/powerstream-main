import React, { useEffect, useContext } from 'react';
import { CopilotContext } from './CopilotCore';
import CopilotLogger from './CopilotLogger';
import CopilotMemory from './CopilotMemory';
import CopilotTerminalBridge from './CopilotTerminalBridge';
import SovereignModeToggle from '../control-ui/SovereignModeToggle';
import PentagonOverrideDashboard from '../control-ui/PentagonOverrideDashboard';

const CopilotBridge = () => {
  const { activateCopilot, status } = useContext(CopilotContext);

  useEffect(() => {
    // Auto-initialize bridge when component mounts
    console.log('[CopilotBridge] Initializing Copilot Bridge...');
    activateCopilot();
  }, [activateCopilot]);

  return (
    <div className="copilot-bridge">
      <h2>🧠 Copilot Bridge Activated</h2>
      <p>Status: <strong>{status}</strong></p>

      <div style={{ marginTop: '1rem' }}>
        <SovereignModeToggle />
        <PentagonOverrideDashboard />
        <CopilotLogger />
        <CopilotMemory />
        <CopilotTerminalBridge />
      </div>
    </div>
  );
};

export default CopilotBridge;


