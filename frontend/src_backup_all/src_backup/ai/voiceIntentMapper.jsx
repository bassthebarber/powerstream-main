// frontend/src/ai/VoiceIntentMapper.jsx
import React from 'react';

const VoiceIntentMapper = ({ transcript }) => {
  const intent = transcript?.includes("build") ? "Build Mode" : "Unknown";

  return (
    <div>
      <h4>🗺️ Voice Intent Mapper</h4>
      <p>Detected Intent: {intent}</p>
    </div>
  );
};

export default VoiceIntentMapper;


