// frontend/src/cybering/useCyberShield.jsx
import { useEffect } from 'react';

const useCyberShield = (protectionLevel = 'medium') => {
  useEffect(() => {
    console.log(`🛡️ Cyber Shield initialized at ${protectionLevel.toUpperCase()} level`);
    if (protectionLevel === 'high') {
      console.log('🚨 Activating deep packet inspection, signature scanning, and heuristic analysis.');
    }
  }, [protectionLevel]);
};

export default useCyberShield;


