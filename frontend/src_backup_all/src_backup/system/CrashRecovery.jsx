// frontend/src/system/CrashRecovery.js
import React from "react";
import styles from "./system.module.css";

// You can hook into your logging service or Infinity system here
const logCrash = (error, info) => {
  console.error("🚨 CRASH DETECTED:", error);
  console.log("Component Stack:", info?.componentStack);
  // Optionally send to backend:
  // fetch("/api/system/crash-log", { method: "POST", body: JSON.stringify({ error, info }) });
};

class CrashRecovery extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasCrashed: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasCrashed: true, error };
  }

  componentDidCatch(error, info) {
    logCrash(error, info);

    // Optional: trigger fallback override
    if (window.localStorage.getItem("aiOverride") === "enabled") {
      console.warn("🧠 AI Override: attempting self-recovery...");
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  handleManualReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasCrashed) {
      return (
        <div className={styles.panel}>
          <h2 className={styles.title}>⚠️ System Crash</h2>
          <p>Something went wrong. Please reload the app.</p>
          <button className={styles.buttonPrimary} onClick={this.handleManualReload}>
            Reload PowerStream
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CrashRecovery;


