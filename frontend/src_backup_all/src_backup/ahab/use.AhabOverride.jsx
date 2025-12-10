// frontend/src/ahab/hooks/useAhabOverride.jsx
import { useEffect } from 'react';

const useAhabOverride = () => {
  useEffect(() => {
    console.log("🧠 useAhabOverride triggered. Sovereign control passed.");
  }, []);

  return "Ahab Override Active";
};

export default useAhabOverride;


