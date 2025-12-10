// frontend/src/cybering/threatScanner.jsx
import React, { useEffect, useState } from 'react';
import './cyber.css';

const ThreatScanner = () => {
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    const scan = setInterval(() => {
      const simulatedThreats = ['SQL Injection', 'XSS Attempt', 'Token Spoofing'];
      const found = simulatedThreats[Math.floor(Math.random() * simulatedThreats.length)];
      setThreats(prev => [...prev, `${new Date().toLocaleTimeString()} - Detected: ${found}`]);
    }, 4000);

    return () => clearInterval(scan);
  }, []);

  return (
    <div className="threat-scanner">
      <h3>🕵️ Threat Scanner</h3>
      <ul>
        {threats.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default ThreatScanner;


