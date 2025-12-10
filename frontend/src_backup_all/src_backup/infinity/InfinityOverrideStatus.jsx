// frontend/src/infinity/InfinityOverrideStatus.jsx

import React, { useState, useEffect } from "react";

const InfinityOverrideStatus = () => {
  const [status, setStatus] = useState("Inactive");

  useEffect(() => {
    const timer = setTimeout(() => setStatus("Active"), 1500);
    return () => clearTimeout(timer);
  }, []);

  return <div>Override Status: {status}</div>;
};

export default InfinityOverrideStatus;


