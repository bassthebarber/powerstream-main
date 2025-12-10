import { useEffect, useState } from "react";
import socket from "../socket";
import { apiGet } from "../api";

export default function LibraryPage() {
  const [status, setStatus] = useState("connecting...");
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const onConnect = () => {
      setStatus(`connected: ${socket.id}`);
      socket.emit("studioChatUpdate", "Hello from the browser");
    };
    const onError = (e) => setStatus(`socket error: ${e?.message || e}`);

    socket.on("connect", onConnect);
    socket.on("connect_error", onError);

    apiGet("/api/health").then(setHealth).catch((e) => {
      console.warn("health error:", e);
      setHealth({ ok: false });
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
    };
