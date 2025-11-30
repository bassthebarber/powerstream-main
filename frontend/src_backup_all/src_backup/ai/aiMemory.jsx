// frontend/src/ai/AIMemory.jsx
import React, { useState, useEffect } from 'react';

const AIMemory = () => {
  const [memory, setMemory] = useState([]);

  useEffect(() => {
    console.log("🧠 AI Memory Initialized");
    setMemory(["Copilot launched", "System override triggered"]);
  }, []);

  return (
    <div>
      <h3>🧠 AI Memory Log</h3>
      <ul>
        {memory.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default AIMemory;


