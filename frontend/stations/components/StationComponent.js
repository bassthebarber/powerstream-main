// frontend/src/components/StationComponent.js
import React from 'react';

export default function StationComponent({ children, className = '' }) {
  return (
    <div className={`station-component ${className}`}>
      {children}
    </div>
  );
}
