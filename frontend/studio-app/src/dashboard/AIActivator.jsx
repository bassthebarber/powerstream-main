// /frontend/src/components/recordingStudio/AIActivator.js
import axios from 'axios';

export async function activateStudioAI(sessionId) {
  try {
    const res = await axios.post('/api/studio/activateAI', { sessionId });
    console.log('🤖 AI Activated for Studio:', res.data);
    return res.data;
  } catch (err) {
    console.error('❌ Error activating AI:', err);
    return null;
  }
}
