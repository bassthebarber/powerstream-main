// frontend/src/ai/SpeechRecognizer.jsx
import React, { useEffect } from 'react';

const SpeechRecognizer = () => {
  useEffect(() => {
    console.log("🎙️ Speech recognizer ready (mock only)");
  }, []);

  return (
    <div>
      <h4>🎙️ Speech Recognizer</h4>
      <p>Voice input system is listening...</p>
    </div>
  );
};

export default SpeechRecognizer;


