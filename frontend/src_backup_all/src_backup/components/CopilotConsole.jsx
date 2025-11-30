// src/components/CopilotConsole.jsx
import { useState } from "react";
import { useDesign } from "@/ai/DesignProvider";

export default function CopilotConsole({ floating = true }) {
  const { runCommand, currentPreset, presets, applyPreset } = useDesign();
  const [cmd, setCmd] = useState("");

  // ... your UI ...
  // on submit: const out = runCommand(cmd);
  // or quick buttons: applyPreset("facebook")
}


