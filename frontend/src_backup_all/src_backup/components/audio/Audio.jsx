import React from 'react';
import AudioFeed from './AudioFeed';
import AudioUploadForm from './AudioUploadForm';

const Audio = () => {
  return (
    <div>
      <h2>🎵 Audio Center</h2>
      <AudioUploadForm />
      <AudioFeed />
    </div>
  );
};

export default Audio;


