// /frontend/src/components/recordingStudio/sequenceHook.js
import { useEffect, useState } from 'react';
import { launchRecordingStudioSession } from './launchRecordingStudio';
import { activateStudioAI } from './dashboard/AIActivator';

export default function useStudioSequence(userId) {
  const [studioReady, setStudioReady] = useState(false);

  useEffect(() => {
    async function initStudio() {
      const session = await launchRecordingStudioSession(userId);
      if (session?.id) {
        const ai = await activateStudioAI(session.id);
        if (ai?.status === 'ready') setStudioReady(true);
      }
    }

    initStudio();
  }, [userId]);

  return studioReady;
}
