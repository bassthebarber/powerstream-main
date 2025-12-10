// CopilotOverrideCore.js
import logicEngine from "./logicEngine.js";
import copilotService from "./copilotService.js";
import overrideEngine from "./overrideEngine.js";

async function CopilotOverrideCore(transcript) {
  console.log('[🎯 CopilotOverrideCore] Triggered with:', transcript);

  try {
    await copilotService.wake();
    await overrideEngine.activate();

    const result = await logicEngine(transcript);

    if (result.command) {
      console.log('[✅ Command Issued]', result.command, result.target || '');
      return result;
    } else if (result.response) {
      console.log('[💬 AI Response]', result.response);
      return result;
    } else {
      return { response: 'No recognizable command executed.' };
    }
  } catch (err) {
    console.error('[❌ Copilot Error]', err);
    return { error: 'Failed to process Copilot command.' };
  }
}

export default CopilotOverrideCore;
