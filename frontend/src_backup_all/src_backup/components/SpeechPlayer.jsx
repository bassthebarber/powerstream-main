// frontend/src/components/SpeechPlayer.jsx

import React from 'react';

const SpeechPlayer = ({ audioUrl }) => {
  return (
    <div style={{ margin: '20px 0' }}>
      <audio controls src={audioUrl} />
    </div>
  );
};

export default SpeechPlayer;


