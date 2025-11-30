import { useEffect, useRef } from "react";
import io from "socket.io-client";

export default function useSocket(serverUrl) {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(serverUrl);
    return () => {
      socketRef.current.disconnect();
    };
  }, [serverUrl]);

  return socketRef.current;
}


