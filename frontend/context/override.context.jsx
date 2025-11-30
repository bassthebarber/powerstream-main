// frontend/src/context/override.context.jsx
import { createContext, useContext, useState } from "react";

export const OverrideContext = createContext();

export const OverrideProvider = ({ children }) => {
  const [overrideActive, setOverrideActive] = useState(false);

  return (
    <OverrideContext.Provider value={{ overrideActive, setOverrideActive }}>
      {children}
    </OverrideContext.Provider>
  );
};

export const useOverride = () => useContext(OverrideContext);
