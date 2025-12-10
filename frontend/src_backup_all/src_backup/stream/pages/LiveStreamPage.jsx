// frontend/pages/stream/LiveStreamPage.js
import React, { useState } from 'react';
import StreamControls from '../../components/stream/StreamControls';
import StreamCyborg from '../../components/stream/StreamCyborg';
import StreamOverlay from '../../components/stream/StreamOverlay';
import StreamPlayer from '../../components/stream/StreamPlayer';

export default function LiveStreamPage() {
  const [streamUrl, setStreamUrl] = useState('');
  const [stats, setStats] = useState({ viewers: 0, likes: 0 });

  const handleStart = () => {
    // Replace with your backend stream key logic
    setStreamUrl('https://your-stream-server/live/stream-key');
    console.log('Stream started');
  };

  const handleStop = () => {
    setStreamUrl('');
    console.log('Stream stopped');
  };

  const handleMute = () => {
    console.log('Muted microphone');
  };

  const handleSwitch = () => {
    console.log('Switched camera');
  };

  const handleAICommand = (cmd) => {
    console.log('AI Command:', cmd);
    // Implement AI-driven stream action
  };

  return (
    <div className="live-stream-page">
      <h2>🎥 Go Live</h2>
      <StreamPlayer streamUrl={streamUrl} />
      <StreamOverlay logo="/logo.png" stats={stats} />
      <StreamControls
        onStart={handleStart}
        onStop={handleStop}
        onMute={handleMute}
        onSwitch={handleSwitch}
      />
      <StreamCyborg onCommand={handleAICommand} />
    </div>
  );
}


