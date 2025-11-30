import React, { useEffect, useState } from "react";
import CopilotTerminal from "./copilotTerminal";
import CopilotLogger from "./copilotLogger";
import { sendCommand } from "../services/copilotService";

const CopilotControlTower = () => {
  const [log, setLog] = useState([]);
  const [output, setOutput] = useState("");

  const handleCommand = async (input) => {
    setLog((prev) => [...prev, `> ${input}`]);
    const result = await sendCommand(input);
    setOutput(result);
    setLog((prev) => [...prev, result]);
  };

  useEffect(() => {
    setLog((prev) => [...prev, "🧠 Copilot Control Tower Online"]);
  }, []);

  return (
    <div
      style={{
        padding: "2rem",
        background: "black",
        color: "gold",
        minHeight: "100vh",
      }}
    >
      <h1>🛰️ Copilot Control Tower</h1>
      <CopilotTerminal onCommand={handleCommand} />
      <CopilotLogger logs={log} />
    </div>
  );
};

export default CopilotControlTower;
