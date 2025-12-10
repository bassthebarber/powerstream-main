// frontend/src/ahab/hooks/useAhabSync.jsx
import { useState, useEffect } from 'react';

const useAhabSync = () => {
  const [status, setStatus] = useState("Not Synced");

  useEffect(() => {
    console.log("📶 Sync in progress...");
    setTimeout(() => setStatus("Synced ✅"), 1500);
  }, []);

  return status;
};

export default useAhabSync;


