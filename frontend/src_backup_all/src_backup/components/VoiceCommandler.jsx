// frontend/src/components/VoiceCommandHandler.jsx

import React, { useEffect } from 'react';

const VoiceCommandHandler = ({ onCommand }) => {
  useEffect(() => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;

    recognition.onresult = event => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      onCommand(transcript);
    };

    recognition.start();

    return () => recognition.stop();
  }, [onCommand]);

  return <p style={{ color: '#FFD700' }}>🎤 Voice Command Listening...</p>;
};

export default VoiceCommandHandler;


