// frontend/src/context/media.context.jsx
import { createContext, useContext, useState } from "react";

export const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [media, setMedia] = useState([]);

  return (
    <MediaContext.Provider value={{ media, setMedia }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
