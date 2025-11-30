// frontend/src/system/SystemStatusPanel.js
import React, { useEffect, useState } from "react";
import styles from "./system.module.css";

export default function SystemStatusPanel() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          setStatus("ONLINE");
        } else {
          setStatus("ISSUES DETECTED");
        }
      } catch {
        setStatus("OFFLINE");
      }
    };

    checkSystem();
    const interval = setInterval(checkSystem, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>🖥 System Status</h3>
      <p className={status === "ONLINE" ? styles.online : styles.offline}>
        {status}
      </p>
    </div>
  );
}


