import React, { useEffect, useState } from "react";
import { io as ioc } from "socket.io-client";

const socketURL =
  import.meta.env.VITE_SOCKET_URL ||
  process.env.REACT_APP_SOCKET_URL ||
  "http://localhost:5001";

export default function DbStatusBanner() {
  const [status, setStatus] = useState("unknown");

  useEffect(() => {
    const socket = ioc(socketURL, { transports: ["websocket"] });
    socket.on("db:status", (p) => setStatus(p?.status || "unknown"));
    fetch((import.meta.env.VITE_API_BASE || "http://localhost:5001/api").replace(/\/api$/,"/health"))
      .then(r => r.json()).then(d => setStatus(d.db || "unknown")).catch(()=>{});
    return () => socket.disconnect();
  }, []);

  if (status === "connected") return null;
  const color = status === "connecting" ? "#d97706" : "#b91c1c";
  const text  = status === "connecting" ? "DB connecting…" : `DB ${status}`;

  return (
    <div style={{
      background: color, color: "white", padding: "6px 10px",
      fontSize: 12, position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999
    }}>
      {text}
    </div>
  );
}


