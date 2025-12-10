// frontend/src/components/ai/override/useOverrideTrigger.js
import { useEffect } from "react";
import useHUD from "../hud/useHUD";
import useMatrix from "../matrix/useMatrix";
import useCopilot from "../copilot/useCopilot";
import useVoice from "../voice/VoiceCommandProtocol";

export default function useOverrideTrigger() {
  useEffect(() => {
    const trigger = async () => {
      console.log("⏳ Initiating Full Override...");

      await useHUD().initializeHUD();
      await useHUD().syncHUD();

      await useMatrix().activateMatrix();
      await useMatrix().runCommandMap();

      await useCopilot().launchCopilot();
      await useCopilot().injectOverrideMemory();

      await useVoice().startVoiceRecognition();

      console.log("🚀 Override complete: AI fully operational.");
    };

    trigger();
  }, []);
}
