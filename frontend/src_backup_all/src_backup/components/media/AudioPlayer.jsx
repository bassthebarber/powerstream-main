import React from 'react';

const AudioPlayer = ({ src }) => (
  <audio controls>
    <source src={src} type="audio/mp3" />
    Your browser does not support the audio element.
  </audio>
);

export default AudioPlayer;


