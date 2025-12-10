// frontend/src/ai/OneCommandBuildTrigger.jsx
import React from 'react';

const OneCommandBuildTrigger = ({ onTrigger }) => {
  const handleClick = () => {
    console.log("🚀 One-Command Build Triggered");
    if (onTrigger) onTrigger();
  };

  return (
    <button onClick={handleClick} style={{ padding: "10px", backgroundColor: "gold", color: "#000" }}>
      🚀 Build Entire System
    </button>
  );
};

export default OneCommandBuildTrigger;


