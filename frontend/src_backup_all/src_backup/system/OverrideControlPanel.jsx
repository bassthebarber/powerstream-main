// frontend/src/system/OverrideControlPanel.js
import React from "react";
import styles from "./system.module.css";

export default function OverrideControlPanel({ overrideEnabled, onToggleOverride }) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>🚨 Override Control</h3>
      <p>Status: 
        <strong className={overrideEnabled ? styles.online : styles.offline}>
          {overrideEnabled ? " ENABLED" : " DISABLED"}
        </strong>
      </p>
      <button
        className={overrideEnabled ? styles.buttonDanger : styles.buttonPrimary}
        onClick={onToggleOverride}
      >
        {overrideEnabled ? "Disable Override" : "Enable Override"}
      </button>
    </div>
  );
}


