import React from 'react';

const PlayerControls = ({ onPlay, onPause, onNext, onPrev }) => (
  <div className="player-controls">
    <button onClick={onPrev}>⏮</button>
    <button onClick={onPlay}>▶️</button>
    <button onClick={onPause}>⏸</button>
    <button onClick={onNext}>⏭</button>
  </div>
);

export default PlayerControls;


