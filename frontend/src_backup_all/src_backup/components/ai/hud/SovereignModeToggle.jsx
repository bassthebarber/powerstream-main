import React, { useState } from 'react';

const SovereignModeToggle = () => {
  const [sovereign, setSovereign] = useState(false);

  return (
    <div className="hud-panel">
      <label>
        <input
          type="checkbox"
          checked={sovereign}
          onChange={() => setSovereign(!sovereign)}
        />
        Sovereign Mode
      </label>
    </div>
  );
};

export default SovereignModeToggle;


