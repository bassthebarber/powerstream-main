// frontend/src/system/PerformanceMonitor.js
import React, { useEffect, useState } from "react";
import styles from "./system.module.css";

export default function PerformanceMonitor() {
  const [stats, setStats] = useState({
    memory: 0,
    cpu: 0,
    fps: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateStats = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const memory = performance.memory
          ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2)
          : "N/A";
        const cpu = (Math.random() * 40 + 10).toFixed(2); // Simulated
        const fps = frameCount;

        setStats({ memory, cpu, fps });
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(updateStats);
    };

    updateStats();
  }, []);

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>📊 Performance Monitor</h3>
      <p>Memory: {stats.memory} MB</p>
      <p>CPU Load: {stats.cpu} %</p>
      <p>FPS: {stats.fps}</p>
    </div>
  );
}


