// frontend/src/ai/IntentProcessor.jsx
import React, { useEffect } from 'react';

const IntentProcessor = ({ intent }) => {
  useEffect(() => {
    if (intent) {
      console.log(`🚦 Processing intent: ${intent}`);
    }
  }, [intent]);

  return (
    <div>
      <h4>🚦 Intent Processor</h4>
      <p>Current Intent: {intent || "None"}</p>
    </div>
  );
};

export default IntentProcessor;


