import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function useAnalyticsSocket() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:5001"
    );

    socket.on("admin-analytics-update", (data) => {
      setEvents((prev) => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  return events;
}
