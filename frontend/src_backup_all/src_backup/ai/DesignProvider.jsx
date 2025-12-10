import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { applyDesignPreset, restoreLastPreset, listPresets } from "./DesignEngine";
import { runCommand as runCmdRouter } from "./CommandRouter";

const DesignCtx = createContext(null);

// Hook your components call
export function useDesign() {
  const ctx = useContext(DesignCtx);
  if (!ctx) throw new Error("useDesign must be used within DesignProvider");
  return ctx;
}

export default function DesignProvider({ children }) {
  const [currentPreset, setCurrentPreset] = useState(null);

  // restore last chosen preset on mount
  useEffect(() => {
    restoreLastPreset();
    const key = localStorage.getItem("ps.designPreset");
    if (key) setCurrentPreset(key);
  }, []);

  const value = useMemo(() => ({
    currentPreset,
    presets: listPresets(),

    applyPreset: (key) => {
      const name = applyDesignPreset(key);
      setCurrentPreset(key);
      return name;
    },

    runCommand: (text) => runCmdRouter(text),
  }), [currentPreset]);

  return <DesignCtx.Provider value={value}>{children}</DesignCtx.Provider>;
}


