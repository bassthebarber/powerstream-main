import React, { useEffect } from 'react';

const HUDInjector = () => {
  useEffect(() => {
    document.body.classList.add('hud-active');
    return () => {
      document.body.classList.remove('hud-active');
    };
  }, []);

  return null;
};

export default HUDInjector;


