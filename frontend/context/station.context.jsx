// frontend/src/context/station.context.jsx
import { createContext, useContext, useState } from "react";

export const StationContext = createContext();

export const StationProvider = ({ children }) => {
  const [stations, setStations] = useState([]);

  return (
    <StationContext.Provider value={{ stations, setStations }}>
      {children}
    </StationContext.Provider>
  );
};

export const useStation = () => useContext(StationContext);
