import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { STUDIO_API_BASE } from "../../config/api.js";

// Use centralized API config for socket connection
const socket = io(STUDIO_API_BASE);

const YoodlesAIProcessor = ({ onAIResponse }) => {
  const [input, setInput] = useState("");
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    socket.on("ai:response", (data) => {
      setResponses((prev) => [...prev, data]);
      if (onAIResponse) onAIResponse(data);
    });

    return () => {
      socket.off("ai:response");
    };
  }, [onAIResponse]);

  const handleSend = () => {
    if (!input.trim()) return;
    socket.emit("ai:command", { prompt: input });
    setInput("");
  };

  return (
    <div className="yoodles-ai-panel">
      <h3>🎛️ Yoodle’s AI Processor</h3>

      <div className="ai-console">
        {responses.map((res, i) => (
          <div key={i} className="ai-response">
            <strong>AI:</strong> {res}
          </div>
        ))}
      </div>

      <div className="ai-input-bar">
        <input
          type="text"
          placeholder="Ask Yoodle or give a studio command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default YoodlesAIProcessor;
