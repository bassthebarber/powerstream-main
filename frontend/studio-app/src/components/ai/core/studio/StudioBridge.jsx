// frontend/studio-app/src/components/ai/core/studio/StudioBridge.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import InfinityStudioHUD from "./InfinityStudioHUD";
import SonicFusionPanel from "./SonicFusionPanel";
import "./studio.css";
import { STUDIO_API_BASE } from "../../../../config/api.js";

// Use centralized API config
const STUDIO_API = STUDIO_API_BASE;

const StudioBridge = () => {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(STUDIO_API);
    setSocket(newSocket);

    newSocket.on("studioProgress", (data) => {
      setProgress(data.progress);
      setStatus(data.status);
    });

    return () => newSocket.close();
  }, []);

  const uploadTrack = async (file) => {
    const formData = new FormData();
    formData.append("track", file);

    setStatus("uploading");

    try {
      const response = await axios.post(`${STUDIO_API}/api/studio/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCurrentTrack(response.data.filename);
      setStatus("ready");
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("error");
    }
  };

  const runMix = async () => {
    setStatus("processing");
    await axios.post(`${STUDIO_API}/api/studio/mix`, { track: currentTrack });
  };

  const runMaster = async () => {
    setStatus("processing");
    await axios.post(`${STUDIO_API}/api/studio/master`, { track: currentTrack });
  };

  return (
    <div className="studioBridge">
      <InfinityStudioHUD status={status} progress={progress} currentTrack={currentTrack} />
      <SonicFusionPanel onUpload={uploadTrack} onMix={runMix} onMaster={runMaster} />
    </div>
  );
};

export default StudioBridge;
