import React from 'react';

export default function StreamReadyPlayer() {
  return (
    <div className="stream-player">
      <h2>🎶 Stream Ready</h2>
      <audio controls>
        <source src="/track.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
