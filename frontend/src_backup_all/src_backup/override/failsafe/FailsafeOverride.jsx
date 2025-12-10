// frontend/src/override/failsafe/FailsafeOverride.jsx
import React from "react";

const FailsafeOverride = () => {
  const activateFailsafe = () => {
    console.warn("Failsafe engaged. Critical systems protected.");
  };

  return (
    <button onClick={activateFailsafe} style={{ backgroundColor: "gold" }}>
      Activate Failsafe
    </button>
  );
};

export default FailsafeOverride;


