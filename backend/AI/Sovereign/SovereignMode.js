import { enforceSovereignLaws } from './SovereignLaws.js';
import { activateSovereignOverride } from './SovereignOverride.js';
import { runPresidentRelay } from './PresidentRelay.js';
import { executeTransfer } from './SovereignTransfer.js';

export const engageSovereignMode = (key, context = {}) => {
  console.log('👑 Sovereign Mode activated...');

  if (!enforceSovereignLaws(key)) {
    return { status: 'unauthorized', message: 'Invalid sovereign credentials' };
  }

  if (context.override) {
    return activateSovereignOverride(context);
  }

  if (context.transfer) {
    return executeTransfer(context);
  }

  return runPresidentRelay(context);
};
