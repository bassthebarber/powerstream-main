// frontend/src/ahab/AhabOverride.jsx
import React, { useEffect } from 'react';

const AhabOverride = () => {
  useEffect(() => {
    console.log("🛑 Ahab Override activated.");
  }, []);

  return (
    <div>
      <h4>⚠️ Ahab Override Mode Enabled</h4>
      <p>System is now in Sovereign Command Override mode.</p>
    </div>
  );
};

export default AhabOverride;


