import React, { useEffect, useContext } from 'react';
import { CopilotContext } from '../../../components/copilot/CopilotCore';
import { sendCommandToMatrix } from '../../matrix/MatrixControl';

const CommandTriggerHandler = ({ triggerCommand }) => {
  const { activateCopilot, status } = useContext(CopilotContext);

  useEffect(() => {
    if (triggerCommand) {
      console.log('[CommandTriggerHandler] Received Command:', triggerCommand);
      // Pass the command to Matrix logic
      sendCommandToMatrix(triggerCommand);

      // Optionally trigger Copilot or other subsystems
      if (triggerCommand === 'ACTIVATE_AI') {
        activateCopilot();
      }
    }
  }, [triggerCommand, activateCopilot]);

  return (
    <div className="command-trigger-handler">
      <p>Command Triggered: <strong>{triggerCommand}</strong></p>
      <p>Copilot Status: <strong>{status}</strong></p>
    </div>
  );
};

export default CommandTriggerHandler;


