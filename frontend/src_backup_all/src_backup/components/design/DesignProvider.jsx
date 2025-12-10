import React, { createContext, useContext, useState } from "react";

const DesignContext = createContext(null);

export function DesignProvider({ children }) {
  const [state, setState] = useState({
    sidebar: true,
    rightRail: true,
    stories: true,
    density: "comfortable"
  });

  return (
    <DesignContext.Provider value={{ state, setState }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error("useDesign must be used within DesignProvider");
  return ctx;
}


