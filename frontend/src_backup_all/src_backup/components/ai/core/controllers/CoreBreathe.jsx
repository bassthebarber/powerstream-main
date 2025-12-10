import React, { useEffect } from 'react';

const CoreBreathe = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Infinity Core is breathing...');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return <p>🫁 Breathing cycle active.</p>;
};

export default CoreBreathe;


