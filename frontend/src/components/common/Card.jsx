// frontend/src/components/common/Card.jsx
// Card container component per Overlord Spec
import React from "react";
import "./common.css";

export default function Card({
  children,
  variant = "default", // default, glass, elevated
  padding = "medium", // none, small, medium, large
  className = "",
  onClick,
  ...props
}) {
  const classNames = [
    "ps-card",
    `ps-card--${variant}`,
    `ps-card--pad-${padding}`,
    onClick && "ps-card--clickable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} onClick={onClick} {...props}>
      {children}
    </div>
  );
}



