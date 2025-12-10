// frontend/src/sockets/BuildProgress.jsx

import React, { useEffect, useState } from "react";
import { socket } from "../lib/socket";

const BuildProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    socket.on("build-progress", (value) => {
      setProgress(value);
    });
    return () => socket.off("build-progress");
  }, []);

  return (
    <div className="build-progress">
      <h4>Platform Build Progress</h4>
      <progress value={progress} max="100" />
    </div>
  );
};

export default BuildProgress;


