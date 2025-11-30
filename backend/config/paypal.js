import { routeCommand } from './CommandRouter.js';
import { recoverFromCrash } from './RecoveryDaemon.js';

export const bootAI = () => {
  console.log('🚀 PowerStream AI Bootloader initialized...');
  recoverFromCrash();

  setTimeout(() => {
    routeCommand('initialize AI core');
  }, 1000);
};
