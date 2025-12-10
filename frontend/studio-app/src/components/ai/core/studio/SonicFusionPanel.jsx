// frontend/src/components/ai/core/studio/SonicFusionPanel.jsx
import React, { useState } from "react";
import "./studio.css";

const SonicFusionPanel = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Upload handler (your existing one)
  const handleUpload = () => {
    if (!selectedFile) return alert("Please select an audio file first.");
    onUpload(selectedFile);
  };

  // 🔥 NEW FUNCTION: Send AI Job to backend
  async function sendAIJob(operation) {
    if (!selectedFile) {
      alert("Please upload a file before starting the AI process.");
      return;
    }

    try {
      setIsProcessing(true);

      const res = await fetch("/api/ai/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sonicfusion",
          payload: {
            file: selectedFile.name,
            operation, // "auto-mix" or "auto-master"
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`AI ${operation} started! Job ID: ${data.jobId}`);
      } else {
        alert("Failed to start AI process. Check backend logs.");
      }
    } catch (error) {
      console.error("Error sending AI job:", error);
      alert("Error connecting to AI backend.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fusionPanel">
      <h2>🎛️ SonicFusion Panel</h2>

      <div className="upload-section">
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload Track</button>
      </div>

      <div className="control-buttons">
        <button
          className="button-gold"
          disabled={isProcessing}
          onClick={() => sendAIJob("auto-mix")}
        >
          {isProcessing ? "Mixing..." : "AI Mix"}
        </button>

        <button
          className="button-gold"
          disabled={isProcessing}
          onClick={() => sendAIJob("auto-master")}
        >
          {isProcessing ? "Mastering..." : "AI Master"}
        </button>
      </div>
    </div>
  );
};

export default SonicFusionPanel;
