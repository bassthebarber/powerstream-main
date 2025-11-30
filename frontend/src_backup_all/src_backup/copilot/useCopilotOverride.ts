// frontend/src/copilot/core/useCopilotOverride.ts

import { useEffect } from 'react';

const useCopilotOverride = (command: string, onExecute: (cmd: string) => void) => {
  useEffect(() => {
    if (command) {
      onExecute(command);
    }
  }, [command, onExecute]);
};

export default useCopilotOverride;

