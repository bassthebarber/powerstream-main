import { loadReality } from './MatrixRealityEngine.js';
import { processMatrixCommand } from './MatrixCommandMap.js';
import { activateMatrixOverride } from './MatrixOverride.js';
import { uplinkFrontend } from './MatrixUplink.js';
import { interpretVisuals } from './VisualInterpreter.js';

export const startMatrix = (input) => {
  console.log('🧠 Matrix Core initiated...');

  const command = processMatrixCommand(input);

  if (!command) {
    console.warn('🌀 Unknown matrix command.');
    return;
  }

  if (command.override) {
    activateMatrixOverride(command);
    return;
  }

  const visual = interpretVisuals(command);
  uplinkFrontend(visual);
  loadReality(command.scene || 'default');
};
