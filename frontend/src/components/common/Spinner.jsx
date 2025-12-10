// frontend/src/components/common/Spinner.jsx
// Loading spinner component per Overlord Spec
import React from "react";
import "./common.css";

export default function Spinner({
  size = "medium", // small, medium, large
  color = "gold", // gold, white, black
  className = "",
}) {
  return (
    <div
      className={`ps-spinner ps-spinner--${size} ps-spinner--${color} ${className}`}
    />
  );
}



