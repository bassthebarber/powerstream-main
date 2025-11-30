// frontend/src/cybering/useCyberingAI.jsx
import { useEffect } from 'react';

const useCyberingAI = (intelFeed) => {
  useEffect(() => {
    if (!intelFeed) return;
    console.log('🤖 Cybering AI Monitoring:', intelFeed);
    if (intelFeed.includes('breach')) {
      console.warn('⚠️ Alert: Potential breach detected by AI protocol.');
    }
  }, [intelFeed]);
};

export default useCyberingAI;


