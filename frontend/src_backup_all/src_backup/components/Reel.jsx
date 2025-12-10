// frontend/src/components/Reel.jsx

import React from 'react';

const Reel = ({ videoUrl }) => {
  return (
    <div style={{ marginBottom: '30px' }}>
      <video src={videoUrl} controls width="100%" />
    </div>
  );
};

export default Reel;


