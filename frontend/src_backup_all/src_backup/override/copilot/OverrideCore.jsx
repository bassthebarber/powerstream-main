// frontend/src/override/copilot/OverrideCore.jsx
import React, { useEffect } from "react";
import { useOverride } from "../../context/override.context";
import CommandTriggerBoot from "./CommandTriggerBoot";

const OverrideCore = () => {
  const { overrideActive, setOverrideActive } = useOverride();

  useEffect(() => {
    if (!overrideActive) {
      setTimeout(() => {
        setOverrideActive(true);
        console.log("Override core activated.");
      }, 1500);
    }
  }, [overrideActive, setOverrideActive]);

  return overrideActive ? <CommandTriggerBoot /> : null;
};

export default OverrideCore;


