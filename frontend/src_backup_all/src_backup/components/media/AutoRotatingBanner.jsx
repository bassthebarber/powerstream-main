import React, { useEffect, useState } from 'react';

const AutoRotatingBanner = ({ banners, interval = 4000 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, interval);
    return () => clearInterval(timer);
  }, [banners.length, interval]);

  return <img src={banners[index]} alt="Rotating Banner" />;
};

export default AutoRotatingBanner;


