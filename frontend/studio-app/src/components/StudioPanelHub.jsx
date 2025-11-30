import React, { useState } from "react";
import StudioLinkDashboard from "./studioLink/StudioLinkDashboard";
import StudioVideoPanel from "./studioLink/StudioVideoPanel";
import StudioMeters from "./studioLink/StudioMeters";
import StudioChat from "./studioLink/StudioChat";
import StudioAIPanel from "./studioLink/StudioAIPanel";
import "../components/studio.css";

const StudioPanelHub = () => {
  const [activePanel, setActivePanel] = useState("dashboard");

  const renderPanel = () => {
    switch (activePanel) {
      case "video": return <StudioVideoPanel />;
      case "meters": return <StudioMeters />;
      case "chat": return <StudioChat />;
      case "ai": return <StudioAIPanel />;
      default: return <StudioLinkDashboard />;
    }
  };

  return (
    <div className="studio-hub">
      <nav className="studio-nav">
        <button onClick={() => setActivePanel("dashboard")}>Dashboard</button>
        <button onClick={() => setActivePanel("video")}>Video</button>
        <button onClick={() => setActivePanel("meters")}>Meters</button>
        <button onClick={() => setActivePanel("chat")}>Chat</button>
        <button onClick={() => setActivePanel("ai")}>AI</button>
      </nav>

      <div className="studio-panel">
        {renderPanel()}
      </div>
    </div>
  );
};

export default StudioPanelHub;
