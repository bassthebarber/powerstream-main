import React, { useEffect, useState } from "react";
import { subscribeToBuildProgress } from "../sockets/buildProgress";

export default function BuildPanel() {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    subscribeToBuildProgress((data) => {
      setProgress(data.progress);
      setLogs((prev) => [...prev, `${data.msg} (${data.progress}%)`]);
    });
  }, []);

  return (
    <div style={{ padding: "1rem", background: "#111", color: "#FFD700" }}>
      <h3>Build Progress</h3>
      <div style={{ background: "#333", height: "20px", marginBottom: "10px" }}>
        <div
          style={{
            background: "#FFD700",
            width: `${progress}%`,
            height: "100%"
          }}
        />
      </div>
      <ul>
        {logs.map((log, idx) => (
          <li key={idx}>{log}</li>
        ))}
      </ul>
    </div>
  );
}


