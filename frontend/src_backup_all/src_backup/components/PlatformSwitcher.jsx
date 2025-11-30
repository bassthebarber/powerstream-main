// frontend/src/components/PlatformSwitcher.jsx

import React from 'react';

const PlatformSwitcher = ({ current, onSwitch }) => {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
      <button onClick={() => onSwitch('feed')}>PowerFeed</button>
      <button onClick={() => onSwitch('gram')}>PowerGram</button>
      <button onClick={() => onSwitch('reel')}>PowerReel</button>
      <button onClick={() => onSwitch('tv')}>TV</button>
    </div>
  );
};

export default PlatformSwitcher;


