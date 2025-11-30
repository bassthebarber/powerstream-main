// frontend/components/stream/StreamOverlay.js
import React from 'react';

export default function StreamOverlay({ logo, stats }) {
  return (
    <div className="stream-overlay">
      {logo && (
        <img
          src={logo}
          alt="Overlay Logo"
          className="overlay-logo"
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            height: '40px',
            zIndex: 999,
          }}
        />
      )}
      {stats && (
        <div
          className="overlay-stats"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            color: '#fff',
            background: 'rgba(0,0,0,0.6)',
            padding: '5px 10px',
            borderRadius: '5px',
            zIndex: 999,
          }}
        >
          👁 {stats.viewers} | ❤️ {stats.likes}
        </div>
      )}
    </div>
  );
}


