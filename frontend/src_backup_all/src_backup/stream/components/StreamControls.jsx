// frontend/components/stream/StreamControls.js
import React from 'react';

export default function StreamControls({ onStart, onStop, onMute, onSwitch }) {
  return (
    <div className="stream-controls">
      <button onClick={onStart}>▶ Start</button>
      <button onClick={onStop}>⏹ Stop</button>
      <button onClick={onMute}>🔇 Mute</button>
      <button onClick={onSwitch}>🔄 Switch Camera</button>
    </div>
  );
}


