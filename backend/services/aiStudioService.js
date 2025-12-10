// backend/services/aiStudioService.js
import { enhanceAudio } from './audioEnhancerService.js';
import { mixTrack } from './mixingEngine.js';
import { masterTrack } from './masteringService.js';

export async function processStudioSession({ vocals, beat }) {
  const enhancedVocals = enhanceAudio(vocals);
  const mix = mixTrack(enhancedVocals.buffer, beat);
  const master = masterTrack(mix.mixedTrack);

  return {
    finalTrack: master.masteredTrack,
    logs: {
      enhanced: enhancedVocals.message,
      mixed: mix.status,
      mastered: master.status
    }
  };
}
