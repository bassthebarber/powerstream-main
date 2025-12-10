// frontend/src/components/ServiceNotConfiguredBanner.jsx
// Reusable banner for gracefully showing when a service is not configured

import React, { useState } from "react";

/**
 * Banner component for showing service not configured states
 * @param {string} message - The message to display
 * @param {string} type - "info" | "warning" | "error"
 * @param {boolean} dismissible - Whether the banner can be dismissed
 * @param {function} onDismiss - Callback when dismissed
 */
export default function ServiceNotConfiguredBanner({
  message,
  type = "info",
  dismissible = true,
  onDismiss,
  icon = "ℹ️",
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const typeStyles = {
    info: {
      background: "rgba(59, 130, 246, 0.1)",
      border: "1px solid rgba(59, 130, 246, 0.3)",
      color: "#60a5fa",
    },
    warning: {
      background: "rgba(245, 158, 11, 0.1)",
      border: "1px solid rgba(245, 158, 11, 0.3)",
      color: "#fbbf24",
    },
    error: {
      background: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      color: "#f87171",
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      style={{
        ...style,
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span>{icon}</span>
        <span>{message}</span>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "18px",
            padding: "4px",
            opacity: 0.7,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

/**
 * Hook to check if an API response indicates service not configured
 */
export function useServiceStatus(apiResponse) {
  const isNotConfigured = apiResponse?.code === "SERVICE_NOT_CONFIGURED";
  const message = apiResponse?.message || "This service is not configured.";
  
  return {
    isNotConfigured,
    message,
    serviceName: apiResponse?.service,
  };
}

/**
 * Helper to determine if response is a service configuration error
 */
export function isServiceNotConfigured(response) {
  return response?.code === "SERVICE_NOT_CONFIGURED";
}



