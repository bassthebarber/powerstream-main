import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";
import StudioVideoPanel from "./StudioVideoPanel";
import StudioMeters from "./StudioMeters";
import StudioChat from "./StudioChat";
import StudioAIPanel from "./StudioAIPanel";
import "./studioLink.css";

const socket = io(import.meta.env.VITE_BACKEND_URL, { transports: ["websocket"] });

export default function StudioLinkDashboard() {
  const [peers, setPeers] = useState([]);
  const [messages, setMessages] = useState([]);
  const myVideo = useRef();
  const [stream, setStream] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((localStream) => {
        setStream(localStream);
        if (myVideo.current) myVideo.current.srcObject = localStream;
        socket.emit("registerDevice", { token: localStorage.getItem("studio_token") });
      });

    socket.on("registered", () => console.log("StudioLink connected"));
    socket.on("signal", handleSignal);
    socket.on("chat", (msg) => setMessages((p) => [...p, msg]));
    return () => socket.disconnect();
  }, []);

  function handleSignal({ from, data }) {
    // Handle incoming WebRTC signals
  }

  function sendMessage(text) {
    socket.emit("chat", { text, from: localStorage.getItem("studio_user") });
  }

  return (
    <div className="studio-dashboard">
      <div className="studio-main">
        <StudioVideoPanel myVideo={myVideo} peers={peers} />
        <StudioMeters stream={stream} />
        <StudioAIPanel socket={socket} />
      </div>
      <StudioChat messages={messages} onSend={sendMessage} />
    </div>
  );
}
