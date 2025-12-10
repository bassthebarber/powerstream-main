// src/providers/DesignProvider.jsx
import React, { createContext, useContext, useState } from "react";

const DesignContext = createContext(null);

export function DesignProvider({ children }) {
  const [design, setDesign] = useState({
    theme: "dark",
    accent: "#f9a44c", // your gold
  });

  return (
    <DesignContext.Provider value={{ design, setDesign }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error("useDesign must be used within DesignProvider");
  return ctx;
}


