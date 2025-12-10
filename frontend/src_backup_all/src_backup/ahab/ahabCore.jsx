// frontend/src/ahab/AhabCore.jsx
import React, { useEffect } from 'react';

const AhabCore = () => {
  useEffect(() => {
    console.log("🧠 Ahab Core Loaded. Brain syncing...");
  }, []);

  return (
    <div>
      <h3>🧠 Ahab Core Module</h3>
      <p>Processing override signals and core sync layers...</p>
    </div>
  );
};

export default AhabCore;


