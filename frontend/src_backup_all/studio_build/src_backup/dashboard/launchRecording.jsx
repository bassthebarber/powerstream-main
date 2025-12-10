// ✅ FILE 1: /frontend/src/components/recordingStudio/launchRecordingStudio.js

import axios from 'axios';

export async function launchRecordingStudioSession(userId) {
  try {
    const session = await axios.post('/api/studio/session/init', { userId });
    console.log('🎬 Studio Session Initialized:', session.data);
    return session.data;
  } catch (err) {
    console.error('❌ Error initializing studio session:', err);
    return null;
  }
}
