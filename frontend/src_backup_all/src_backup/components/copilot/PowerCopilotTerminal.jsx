import React, { useState } from "react";
import useCopilot from "../ai/copilot/useCopilot";
import styles from "./PowerCopilotTerminal.module.css";

export default function PowerCopilotTerminal() {
  const { executeCopilotCommand } = useCopilot();
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);

  const handleCommand = async () => {
    setLog((prev) => [...prev, `> ${input}`]);
    const output = await executeCopilotCommand(input);
    setLog((prev) => [...prev, output || "⚠️ No response."]);
    setInput("");
  };

  return (
    <div className={styles.terminal}>
      <div className={styles.output}>
        {log.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <input
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCommand()}
        placeholder="Type AI Copilot Command..."
      />
    </div>
  );
}


