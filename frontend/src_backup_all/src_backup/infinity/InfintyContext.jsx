// frontend/src/infinity/InfinityContext.jsx

import React, { createContext, useContext, useState } from "react";

const InfinityContext = createContext();

export const useInfinityContext = () => useContext(InfinityContext);

export const InfinityProvider = ({ children }) => {
  const [systemOnline, setSystemOnline] = useState(true);

  return (
    <InfinityContext.Provider value={{ systemOnline, setSystemOnline }}>
      {children}
    </InfinityContext.Provider>
  );
};


