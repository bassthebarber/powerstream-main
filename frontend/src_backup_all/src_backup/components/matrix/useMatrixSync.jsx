import { useEffect } from 'react';

const UseMatrixSync = (onSync) => {
  useEffect(() => {
    console.log("Matrix sync initialized...");
    onSync?.();
  }, []);
};

export default UseMatrixSync;


