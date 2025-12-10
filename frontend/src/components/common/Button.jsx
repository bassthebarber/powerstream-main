// frontend/src/components/common/Button.jsx
// Reusable button component per Overlord Spec
import React from "react";
import "./common.css";

export default function Button({
  children,
  variant = "primary", // primary, secondary, ghost, danger
  size = "medium", // small, medium, large
  disabled = false,
  loading = false,
  fullWidth = false,
  type = "button",
  onClick,
  className = "",
  ...props
}) {
  const classNames = [
    "ps-btn",
    `ps-btn--${variant}`,
    `ps-btn--${size}`,
    fullWidth && "ps-btn--full",
    loading && "ps-btn--loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="ps-btn-spinner" />
      ) : (
        children
      )}
    </button>
  );
}


