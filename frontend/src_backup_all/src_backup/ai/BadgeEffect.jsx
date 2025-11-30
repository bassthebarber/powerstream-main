// frontend/src/ai/BadgeEffect.jsx
import React from 'react';

const BadgeEffect = ({ label }) => {
  return (
    <div style={{ border: "2px solid gold", padding: "10px", borderRadius: "8px", color: "#FFD700" }}>
      <h4>🏅 {label || "AI Badge Awarded"}</h4>
    </div>
  );
};

export default BadgeEffect;


