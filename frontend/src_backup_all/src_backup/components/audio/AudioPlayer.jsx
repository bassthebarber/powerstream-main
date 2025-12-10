import React from 'react';

const AudioPlayer = ({ title, src }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h4>{title}</h4>
      <audio controls src={src}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;


