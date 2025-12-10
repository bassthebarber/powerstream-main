// frontend/src/components/common/Modal.jsx
// Reusable modal component per Overlord Spec
import React, { useEffect } from "react";
import "./common.css";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium", // small, medium, large, fullscreen
  closeOnOverlay = true,
  showCloseButton = true,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="ps-modal-overlay"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        className={`ps-modal ps-modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="ps-modal-header">
            {title && <h2 className="ps-modal-title">{title}</h2>}
            {showCloseButton && (
              <button className="ps-modal-close" onClick={onClose}>
                ✕
              </button>
            )}
          </div>
        )}

        <div className="ps-modal-body">{children}</div>

        {footer && <div className="ps-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}



