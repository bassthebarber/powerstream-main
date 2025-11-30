// frontend/src/copilot/core/AutopilotIgnitionButton.jsx
import React from "react";
import useCopilotOverride from "../hooks/useCopilotOverride";

const AutopilotIgnitionButton = () => {
  const { triggerOverride } = useCopilotOverride();

  const handleIgnition = () => {
    console.log("🧠 Autopilot Ignition Triggered");
    triggerOverride("ignite-autopilot");
  };

  return (
    <button
      onClick={handleIgnition}
      style={{
        padding: "10px 20px",
        backgroundColor: "gold",
        color: "#000",
        border: "2px solid #fff",
        borderRadius: "8px",
        fontWeight: "bold",
        boxShadow: "0 0 10px gold",
        cursor: "pointer",
      }}
    >
      🚀 Ignite Autopilot
    </button>
  );
};

export default AutopilotIgnitionButton;


