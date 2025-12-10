// frontend/src/override/ai/StartupCheck.jsx
import React, { useEffect } from "react";

const StartupCheck = ({ onSuccess }) => {
  useEffect(() => {
    const startupConfirmed = localStorage.getItem("override_init") === "true";
    if (startupConfirmed && onSuccess) onSuccess();
  }, [onSuccess]);

  return null;
};

export default StartupCheck;


